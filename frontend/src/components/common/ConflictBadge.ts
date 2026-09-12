import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { BerthPlanConflict } from "../../types/BerthPlan";
import { formatDate } from "../../utils/formatters";

@Component({
  selector: "app-conflict-badge",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="conflict-badge" *ngIf="conflicts.length > 0">
      <strong>时间冲突 {{ conflicts.length }} 项</strong>
      <ul>
        <li *ngFor="let conflict of conflicts">
          船名 {{ conflict.vessel_name }} · 泊位 {{ conflict.berth_code }} · 重叠 {{ fmt(conflict.overlap_start) }} ~ {{ fmt(conflict.overlap_end) }}
        </li>
      </ul>
    </div>
  `,
  styles: [`.conflict-badge{border:1px solid #d39b46;background:#fdf3e3;border-radius:8px;padding:12px 14px;color:#7d4d18;margin-top:12px}.conflict-badge ul{margin:8px 0 0;padding-left:18px}`]
})
export class ConflictBadge {
  @Input() conflicts: BerthPlanConflict[] = [];
  fmt = formatDate;
}
