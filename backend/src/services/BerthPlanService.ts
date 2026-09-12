import { berthPlanRepository } from "../repositories/BerthPlanRepository";
import { vesselRepository } from "../repositories/VesselRepository";
import { berthRepository } from "../repositories/BerthRepository";
import { BerthPlanStatus } from "../constants/BerthPlanStatus";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { createBerthPlanDto, createBerthPlanConflictDto } from "../constructors/BerthPlanDtoFactory";
import { toAuditTarget } from "../utils/formatters";
import type { BerthPlan } from "../models/BerthPlan";
import type { BerthPlanConflict, BerthPlanPayload, BerthPlanPrecheckResult } from "../types/BerthPlanPayload";

export class BerthPlanError extends Error {
  constructor(
    public code: string,
    public status: number,
    message?: string,
    public details?: unknown
  ) {
    super(message ?? code);
  }
}

const timeOf = (value: string): number => {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    throw new BerthPlanError(ERROR_CODES.VALIDATION_FAILED, 400, `${ERROR_MESSAGES.VALIDATION_FAILED}: ${value}`);
  }
  return time;
};

const validateWindow = (arrival: string, departure: string): { start: number; end: number } => {
  const start = timeOf(arrival);
  const end = timeOf(departure);
  if (end <= start) {
    throw new BerthPlanError(ERROR_CODES.VALIDATION_FAILED, 400, ERROR_MESSAGES.VALIDATION_FAILED);
  }
  return { start, end };
};

const validatePayload = (payload: Partial<BerthPlanPayload>): BerthPlanPayload => {
  if (!payload || payload.vessel_id == null || payload.berth_id == null || !payload.planned_arrival || !payload.planned_departure) {
    throw new BerthPlanError(ERROR_CODES.VALIDATION_FAILED, 400, ERROR_MESSAGES.VALIDATION_FAILED);
  }
  validateWindow(payload.planned_arrival, payload.planned_departure);
  return payload as BerthPlanPayload;
};

const findConflicts = (candidate: { berth_id: number; planned_arrival: string; planned_departure: string; excludeId?: number }): BerthPlanConflict[] => {
  const { start, end } = validateWindow(candidate.planned_arrival, candidate.planned_departure);
  const vessels = vesselRepository.findAll();
  const berths = berthRepository.findAll();
  return berthPlanRepository
    .findActiveByBerthId(candidate.berth_id, candidate.excludeId)
    .filter((row) => start < timeOf(row.planned_departure) && end > timeOf(row.planned_arrival))
    .map((row) =>
      createBerthPlanConflictDto({
        plan_id: row.id,
        vessel_id: row.vessel_id,
        vessel_name: vessels.find((vessel) => vessel.id === row.vessel_id)?.vessel_name ?? `#${row.vessel_id}`,
        berth_id: row.berth_id,
        berth_code: berths.find((berth) => berth.id === row.berth_id)?.berth_code ?? `#${row.berth_id}`,
        planned_arrival: row.planned_arrival,
        planned_departure: row.planned_departure,
        overlap_start: new Date(Math.max(start, timeOf(row.planned_arrival))).toISOString(),
        overlap_end: new Date(Math.min(end, timeOf(row.planned_departure))).toISOString()
      })
    );
};

const resolveStatus = (requested: string | undefined, conflicts: BerthPlanConflict[]): string => {
  if (conflicts.length > 0) return "CONFLICT";
  if (requested && (BerthPlanStatus as readonly string[]).includes(requested)) return requested;
  return "DRAFT";
};

const mustFind = (id: number): BerthPlan => {
  const plan = berthPlanRepository.findById(id);
  if (!plan) {
    throw new BerthPlanError(ERROR_CODES.BERTH_PLAN_NOT_FOUND, 404, ERROR_MESSAGES.BERTH_PLAN_NOT_FOUND);
  }
  return plan;
};

export const berthPlanService = {
  list: (): BerthPlan[] => berthPlanRepository.findAll(),

  precheck: (payload: Partial<BerthPlanPayload>): BerthPlanPrecheckResult => {
    const candidate = validatePayload(payload);
    const conflicts = findConflicts(candidate);
    console.info(LOG_TEMPLATES.BerthPlan[4], toAuditTarget("BerthPlan", "precheck"), `berth=${candidate.berth_id}`, `conflicts=${conflicts.length}`);
    return { has_conflict: conflicts.length > 0, conflicts };
  },

  create: (payload: Partial<BerthPlanPayload>): BerthPlan => {
    const candidate = validatePayload(payload);
    const conflicts = findConflicts(candidate);
    const status = resolveStatus(candidate.status, conflicts);
    const { id: _id, ...row } = createBerthPlanDto({ ...candidate, status });
    const saved = berthPlanRepository.save(row);
    console.info(LOG_TEMPLATES.BerthPlan[0], toAuditTarget("BerthPlan", saved.id), `status=${saved.status}`);
    if (conflicts.length > 0) {
      console.info(LOG_TEMPLATES.BerthPlan[5], toAuditTarget("BerthPlan", saved.id), conflicts.map((c) => `${c.vessel_name}@${c.berth_code}`).join(","));
    }
    return saved;
  },

  update: (id: number, payload: Partial<BerthPlanPayload>): BerthPlan => {
    const current = mustFind(id);
    const next = { ...current, ...payload, id: current.id };
    validateWindow(next.planned_arrival, next.planned_departure);
    const conflicts = findConflicts({ ...next, excludeId: id });
    const requested = payload.status ?? (current.status === "CONFLICT" ? "DRAFT" : current.status);
    const status = resolveStatus(requested, conflicts);
    const saved = berthPlanRepository.update(id, { ...next, status }) as BerthPlan;
    console.info(LOG_TEMPLATES.BerthPlan[1], toAuditTarget("BerthPlan", id), `status=${saved.status}`);
    if (conflicts.length > 0) {
      console.info(LOG_TEMPLATES.BerthPlan[5], toAuditTarget("BerthPlan", id), conflicts.map((c) => `${c.vessel_name}@${c.berth_code}`).join(","));
    }
    return saved;
  },

  approve: (id: number): BerthPlan => {
    const plan = mustFind(id);
    const conflicts = findConflicts({ ...plan, excludeId: id });
    if (conflicts.length > 0) {
      console.info(LOG_TEMPLATES.BerthPlan[7], toAuditTarget("BerthPlan", id), conflicts.map((c) => `${c.vessel_name}@${c.berth_code}`).join(","));
      throw new BerthPlanError(ERROR_CODES.BERTH_PLAN_CONFLICT, 409, ERROR_MESSAGES.BERTH_PLAN_CONFLICT, { has_conflict: true, conflicts });
    }
    const saved = berthPlanRepository.update(id, { status: "APPROVED" }) as BerthPlan;
    console.info(LOG_TEMPLATES.BerthPlan[6], toAuditTarget("BerthPlan", id), `status=${saved.status}`);
    return saved;
  }
};
