import { seed } from "../seed";
import type { BerthPlan } from "../models/BerthPlan";

const rows: BerthPlan[] = seed.berthPlan.map((row) => ({ ...row }));
let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export const berthPlanRepository = {
  findAll: (): BerthPlan[] => rows,
  findById: (id: number): BerthPlan | undefined => rows.find((row) => row.id === id),
  findActiveByBerthId: (berthId: number, excludeId?: number): BerthPlan[] =>
    rows.filter((row) => row.berth_id === berthId && row.id !== excludeId && row.status !== "CANCELLED"),
  save: (row: Omit<BerthPlan, "id">): BerthPlan => {
    const saved: BerthPlan = { ...row, id: nextId++ };
    rows.push(saved);
    return saved;
  },
  update: (id: number, patch: Partial<BerthPlan>): BerthPlan | undefined => {
    const current = rows.find((row) => row.id === id);
    if (!current) return undefined;
    Object.assign(current, patch, { id });
    return current;
  }
};
