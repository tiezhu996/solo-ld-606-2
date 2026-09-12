import type { BerthPlan, BerthPlanConflict } from "../types/BerthPlan";

export const createDefaultBerthPlan = (overrides: Partial<BerthPlan> = {}): BerthPlan => ({
  id: 0,
  vessel_id: 1,
  berth_id: 1,
  planned_arrival: "2026-09-16T08:00:00+08:00",
  planned_departure: "2026-09-17T08:00:00+08:00",
  priority: "MEDIUM",
  status: "DRAFT",
  dispatcher_id: 1,
  ...overrides
});

export const createBerthPlanForm = createDefaultBerthPlan;
export const createBerthPlanResponse = createDefaultBerthPlan;

export const createBerthPlanConflict = (overrides: Partial<BerthPlanConflict> = {}): BerthPlanConflict => ({
  plan_id: 0,
  vessel_id: 0,
  vessel_name: "",
  berth_id: 0,
  berth_code: "",
  planned_arrival: "",
  planned_departure: "",
  overlap_start: "",
  overlap_end: "",
  ...overrides
});
