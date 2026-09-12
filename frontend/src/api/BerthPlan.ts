import { mockData } from "../mocks/seedData";
import type { BerthPlan, BerthPlanPrecheckResult } from "../types/BerthPlan";
import { findBerthConflicts } from "../hooks/useBerthConflict";

const endpoint = "/api/berth-plan";

export async function listBerthPlan(): Promise<BerthPlan[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.berthPlan as unknown as BerthPlan[])];
}

export async function saveBerthPlan(payload: BerthPlan): Promise<BerthPlan> {
  if (typeof fetch !== "undefined") {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  console.info("save BerthPlan", payload);
  return payload;
}

export async function precheckBerthPlan(payload: Partial<BerthPlan>): Promise<BerthPlanPrecheckResult> {
  if (typeof fetch !== "undefined") {
    try {
      const res = await fetch(`${endpoint}/precheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  const conflicts = findBerthConflicts(
    mockData.berthPlan as unknown as BerthPlan[],
    mockData.vessel as unknown as import("../types/Vessel").Vessel[],
    mockData.berth as unknown as import("../types/Berth").Berth[],
    {
      berth_id: Number(payload.berth_id),
      planned_arrival: String(payload.planned_arrival ?? ""),
      planned_departure: String(payload.planned_departure ?? "")
    }
  );
  return { has_conflict: conflicts.length > 0, conflicts };
}

export async function updateBerthPlan(id: number, payload: Partial<BerthPlan>): Promise<BerthPlan> {
  const res = await fetch(`${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw await toApiError(res);
  return await res.json();
}

export async function approveBerthPlan(id: number): Promise<BerthPlan> {
  const res = await fetch(`${endpoint}/${id}/approve`, { method: "POST" });
  if (!res.ok) throw await toApiError(res);
  return await res.json();
}

interface ApiErrorBody {
  code?: string;
  message?: string;
  details?: BerthPlanPrecheckResult;
}

async function toApiError(res: Response): Promise<Error & ApiErrorBody> {
  let body: ApiErrorBody = {};
  try {
    body = await res.json();
  } catch {
    // Non-JSON error body; keep defaults.
  }
  const err = new Error(body.message ?? `HTTP ${res.status}`) as Error & ApiErrorBody;
  err.code = body.code;
  err.details = body.details;
  return err;
}
