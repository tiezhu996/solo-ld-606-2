import { listBerth } from "../api/Berth";
import type { Berth } from "../types/Berth";

export class BerthStore {
  rows: Berth[] = [];
  async load() {
    this.rows = await listBerth();
  }
}
