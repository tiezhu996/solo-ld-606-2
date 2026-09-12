import { approveBerthPlan, listBerthPlan, precheckBerthPlan, saveBerthPlan } from "../api/BerthPlan";
import type { BerthPlan, BerthPlanConflict } from "../types/BerthPlan";

export class BerthPlanStore {
  rows: BerthPlan[] = [];
  conflicts: BerthPlanConflict[] = [];

  async load() {
    this.rows = await listBerthPlan();
  }

  async precheck(payload: Partial<BerthPlan>) {
    const result = await precheckBerthPlan(payload);
    this.conflicts = result.conflicts;
    return result;
  }

  async save(payload: BerthPlan) {
    const saved = await saveBerthPlan(payload);
    await this.load();
    return saved;
  }

  async approve(id: number) {
    const saved = await approveBerthPlan(id);
    await this.load();
    return saved;
  }
}
