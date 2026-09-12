import { listVessel } from "../api/Vessel";
import type { Vessel } from "../types/Vessel";

export class VesselStore {
  rows: Vessel[] = [];
  async load() {
    this.rows = await listVessel();
  }
}
