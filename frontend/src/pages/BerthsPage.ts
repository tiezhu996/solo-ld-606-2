import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import type { BerthPlan, BerthPlanConflict } from "../types/BerthPlan";
import { createBerthPlanForm } from "../constructors/BerthPlanConstructor";
import { BerthPlanStore } from "../stores/BerthPlanStore";
import { VesselStore } from "../stores/VesselStore";
import { BerthStore } from "../stores/BerthStore";
import { ConflictBadge } from "../components/common/ConflictBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { formatDate } from "../utils/formatters";

@Component({
  selector: "app-berths-page",
  standalone: true,
  imports: [CommonModule, FormsModule, ConflictBadge, StatusBadge],
  template: `
  <section class="workbench">
    <div class="panel wide">
      <h2>靠泊计划列表</h2>
      <article class="plan-row" *ngFor="let plan of planStore.rows">
        <strong>{{ vesselName(plan.vessel_id) }}</strong>
        <span>泊位 {{ berthCode(plan.berth_id) }}</span>
        <span>{{ fmt(plan.planned_arrival) }} ~ {{ fmt(plan.planned_departure) }}</span>
        <app-status-badge [status]="plan.status"></app-status-badge>
        <button type="button" (click)="approve(plan)">审批通过</button>
      </article>
      <p class="empty" *ngIf="planStore.rows.length === 0">暂无靠泊计划</p>
    </div>
    <div class="panel">
      <h2>新增靠泊计划</h2>
      <label>船舶
        <select [(ngModel)]="form.vessel_id">
          <option *ngFor="let vessel of vesselStore.rows" [ngValue]="vessel.id">{{ vessel.vessel_name }}</option>
        </select>
      </label>
      <label>泊位
        <select [(ngModel)]="form.berth_id">
          <option *ngFor="let berth of berthStore.rows" [ngValue]="berth.id">{{ berth.berth_code }}</option>
        </select>
      </label>
      <label>计划到港 <input type="datetime-local" [(ngModel)]="form.planned_arrival"></label>
      <label>计划离港 <input type="datetime-local" [(ngModel)]="form.planned_departure"></label>
      <label>优先级
        <select [(ngModel)]="form.priority">
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </label>
      <label>目标状态
        <select [(ngModel)]="form.status">
          <option value="DRAFT">DRAFT</option>
          <option value="APPROVED">APPROVED</option>
        </select>
      </label>
      <div class="actions">
        <button type="button" (click)="precheck()">冲突预检</button>
        <button type="button" (click)="save()">保存</button>
      </div>
      <app-conflict-badge [conflicts]="planStore.conflicts"></app-conflict-badge>
      <p class="notice" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
  </section>
  `,
  styles: [`
    .plan-row{display:grid;grid-template-columns:1fr auto 1fr auto auto;align-items:center;gap:12px;border-top:1px solid #e4e0d3;padding:12px 0}
    label{display:grid;gap:4px;margin-bottom:10px;font-size:13px;color:#596257}
    select,input{padding:8px;border:1px solid #d8d6c8;border-radius:6px;background:#fff}
    .actions{display:flex;gap:8px;margin-top:6px}
    .actions button{background:#274335;color:#f5f1e6;padding:8px 14px;border-radius:6px}
    .notice{color:#274335;font-weight:700}.error{color:#8c2f2f;font-weight:700}
  `]
})
export class BerthsPage implements OnInit {
  planStore = new BerthPlanStore();
  vesselStore = new VesselStore();
  berthStore = new BerthStore();
  form = createBerthPlanForm({ planned_arrival: "2026-09-16T08:00", planned_departure: "2026-09-17T08:00" });
  message = "";
  error = "";
  fmt = formatDate;

  async ngOnInit() {
    await Promise.all([this.planStore.load(), this.vesselStore.load(), this.berthStore.load()]);
  }

  vesselName(id: number): string {
    return this.vesselStore.rows.find((vessel) => vessel.id === id)?.vessel_name ?? `#${id}`;
  }

  berthCode(id: number): string {
    return this.berthStore.rows.find((berth) => berth.id === id)?.berth_code ?? `#${id}`;
  }

  private payload() {
    return {
      ...this.form,
      planned_arrival: new Date(this.form.planned_arrival).toISOString(),
      planned_departure: new Date(this.form.planned_departure).toISOString()
    };
  }

  async precheck() {
    this.message = "";
    this.error = "";
    console.info(LOG_TEMPLATES.BerthPlan[4]);
    const result = await this.planStore.precheck(this.payload());
    this.message = result.has_conflict ? ERROR_MESSAGES.BERTH_PLAN_CONFLICT : "预检通过：同泊位无时间重叠，可保存为 APPROVED";
  }

  async save() {
    this.message = "";
    this.error = "";
    const saved = await this.planStore.save(this.payload() as BerthPlan);
    if (saved.status === "CONFLICT") {
      this.error = ERROR_MESSAGES.BERTH_PLAN_CONFLICT;
      console.info(LOG_TEMPLATES.BerthPlan[5]);
    } else {
      this.message = `${LOG_TEMPLATES.BerthPlan[0]}：#${saved.id} ${saved.status}`;
    }
  }

  async approve(plan: BerthPlan) {
    this.message = "";
    this.error = "";
    try {
      const saved = await this.planStore.approve(plan.id);
      this.message = `${LOG_TEMPLATES.BerthPlan[6]}：#${saved.id}`;
    } catch (err) {
      const apiError = err as Error & { details?: { conflicts?: BerthPlanConflict[] } };
      this.error = apiError.message;
      this.planStore.conflicts = apiError.details?.conflicts ?? [];
      console.info(LOG_TEMPLATES.BerthPlan[7]);
    }
  }
}
