import type { BerthPlan, BerthPlanConflict } from "../types/BerthPlan";
import type { Vessel } from "../types/Vessel";
import type { Berth } from "../types/Berth";
import { createBerthPlanConflict } from "../constructors/BerthPlanConstructor";

export interface BerthConflictCandidate {
  berth_id: number;
  planned_arrival: string;
  planned_departure: string;
  excludeId?: number;
}

export function findBerthConflicts(
  plans: BerthPlan[],
  vessels: Vessel[],
  berths: Berth[],
  candidate: BerthConflictCandidate
): BerthPlanConflict[] {
  const start = new Date(candidate.planned_arrival).getTime();
  const end = new Date(candidate.planned_departure).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return [];
  return plans
    .filter((row) => row.berth_id === candidate.berth_id && row.id !== candidate.excludeId && row.status !== "CANCELLED")
    .filter((row) => start < new Date(row.planned_departure).getTime() && end > new Date(row.planned_arrival).getTime())
    .map((row) =>
      createBerthPlanConflict({
        plan_id: row.id,
        vessel_id: row.vessel_id,
        vessel_name: vessels.find((vessel) => vessel.id === row.vessel_id)?.vessel_name ?? `#${row.vessel_id}`,
        berth_id: row.berth_id,
        berth_code: berths.find((berth) => berth.id === row.berth_id)?.berth_code ?? `#${row.berth_id}`,
        planned_arrival: row.planned_arrival,
        planned_departure: row.planned_departure,
        overlap_start: new Date(Math.max(start, new Date(row.planned_arrival).getTime())).toISOString(),
        overlap_end: new Date(Math.min(end, new Date(row.planned_departure).getTime())).toISOString()
      })
    );
}

export function useBerthConflict(plans: BerthPlan[] = [], vessels: Vessel[] = [], berths: Berth[] = []) {
  return {
    check: (candidate: BerthConflictCandidate) => findBerthConflicts(plans, vessels, berths, candidate)
  };
}
