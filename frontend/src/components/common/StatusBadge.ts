import { Component, Input } from "@angular/core";
import { STATUS_TEXT } from "../../constants/statusText";

@Component({
  selector: "app-status-badge",
  standalone: true,
  template: `<span class="badge" [class.badge-conflict]="status === 'CONFLICT'">{{ text }}</span>`,
  styles: [`.badge-conflict{background:#f8e3e3;color:#8c2f2f}`]
})
export class StatusBadge {
  @Input() status = "";
  get text(): string {
    const table = STATUS_TEXT.BerthPlanStatus as Record<string, string>;
    return table[this.status] ?? this.status;
  }
}
