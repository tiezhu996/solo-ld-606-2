export interface BerthPlan {
  id: number;
  vessel_id: number;
  berth_id: number;
  planned_arrival: string;
  planned_departure: string;
  priority: string;
  status: string;
  dispatcher_id: number;
}

export interface BerthPlanConflict {
  plan_id: number;
  vessel_id: number;
  vessel_name: string;
  berth_id: number;
  berth_code: string;
  planned_arrival: string;
  planned_departure: string;
  overlap_start: string;
  overlap_end: string;
}

export interface BerthPlanPrecheckResult {
  has_conflict: boolean;
  conflicts: BerthPlanConflict[];
}
