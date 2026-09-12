export const mockData = {
  "vessel": [
    {
      "id": 1,
      "vessel_name": "远洋之星",
      "imo_no": "IMO9380001",
      "carrier": "中远海运",
      "length_m": 210,
      "draft_m": 11.5,
      "eta": "2026-09-10T08:00:00+08:00",
      "etd": "2026-09-12T18:00:00+08:00",
      "status": "SCHEDULED"
    },
    {
      "id": 2,
      "vessel_name": "海云86",
      "imo_no": "IMO9380002",
      "carrier": "招商轮船",
      "length_m": 180,
      "draft_m": 10.2,
      "eta": "2026-09-13T06:00:00+08:00",
      "etd": "2026-09-15T12:00:00+08:00",
      "status": "SCHEDULED"
    },
    {
      "id": 3,
      "vessel_name": "蓝海快航",
      "imo_no": "IMO9380003",
      "carrier": "安通控股",
      "length_m": 150,
      "draft_m": 8.6,
      "eta": "2026-09-11T00:00:00+08:00",
      "etd": "2026-09-14T00:00:00+08:00",
      "status": "SCHEDULED"
    },
    {
      "id": 4,
      "vessel_name": "长风9",
      "imo_no": "IMO9380004",
      "carrier": "中谷物流",
      "length_m": 165,
      "draft_m": 9.4,
      "eta": "2026-09-12T12:00:00+08:00",
      "etd": "2026-09-14T08:00:00+08:00",
      "status": "SCHEDULED"
    }
  ],
  "berth": [
    {
      "id": 1,
      "berth_code": "B1",
      "length_m": 250,
      "water_depth_m": 14.5,
      "berth_type": "CONTAINER",
      "current_status": "OCCUPIED",
      "safety_note": "注意涨落潮流速"
    },
    {
      "id": 2,
      "berth_code": "B2",
      "length_m": 200,
      "water_depth_m": 12,
      "berth_type": "BULK",
      "current_status": "FREE",
      "safety_note": "西侧有浅点"
    },
    {
      "id": 3,
      "berth_code": "B3",
      "length_m": 180,
      "water_depth_m": 10.5,
      "berth_type": "GENERAL",
      "current_status": "FREE",
      "safety_note": "夜间靠泊需拖轮协助"
    }
  ],
  "berthPlan": [
    {
      "id": 1,
      "vessel_id": 1,
      "berth_id": 1,
      "planned_arrival": "2026-09-10T08:00:00+08:00",
      "planned_departure": "2026-09-12T18:00:00+08:00",
      "priority": "HIGH",
      "status": "APPROVED",
      "dispatcher_id": 1
    },
    {
      "id": 2,
      "vessel_id": 2,
      "berth_id": 1,
      "planned_arrival": "2026-09-13T06:00:00+08:00",
      "planned_departure": "2026-09-15T12:00:00+08:00",
      "priority": "MEDIUM",
      "status": "APPROVED",
      "dispatcher_id": 1
    },
    {
      "id": 3,
      "vessel_id": 3,
      "berth_id": 2,
      "planned_arrival": "2026-09-11T00:00:00+08:00",
      "planned_departure": "2026-09-14T00:00:00+08:00",
      "priority": "LOW",
      "status": "APPROVED",
      "dispatcher_id": 2
    },
    {
      "id": 4,
      "vessel_id": 4,
      "berth_id": 1,
      "planned_arrival": "2026-09-12T12:00:00+08:00",
      "planned_departure": "2026-09-14T08:00:00+08:00",
      "priority": "MEDIUM",
      "status": "CONFLICT",
      "dispatcher_id": 2
    }
  ],
  "yardSlot": [
    {
      "id": 1,
      "yard_area": "yard area 1",
      "row_no": "row no 1",
      "bay_no": "bay no 1",
      "tier_no": "tier no 1",
      "container_no": "container no 1",
      "slot_status": "CONFLICT",
      "cargo_type": "CONFLICT"
    },
    {
      "id": 2,
      "yard_area": "yard area 2",
      "row_no": "row no 2",
      "bay_no": "bay no 2",
      "tier_no": "tier no 2",
      "container_no": "container no 2",
      "slot_status": "APPROVED",
      "cargo_type": "APPROVED"
    },
    {
      "id": 3,
      "yard_area": "yard area 3",
      "row_no": "row no 3",
      "bay_no": "bay no 3",
      "tier_no": "tier no 3",
      "container_no": "container no 3",
      "slot_status": "DRAFT",
      "cargo_type": "BERTHING"
    }
  ],
  "workTask": [
    {
      "id": 1,
      "berth_plan_id": 1,
      "yard_slot_id": 1,
      "task_type": "CONFLICT",
      "team_id": 1,
      "status": "CONFLICT",
      "planned_start": "planned start 1",
      "finished_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "berth_plan_id": 2,
      "yard_slot_id": 2,
      "task_type": "APPROVED",
      "team_id": 2,
      "status": "APPROVED",
      "planned_start": "planned start 2",
      "finished_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "berth_plan_id": 3,
      "yard_slot_id": 3,
      "task_type": "BERTHING",
      "team_id": 3,
      "status": "DRAFT",
      "planned_start": "planned start 3",
      "finished_at": "2026-06-13T09:00:00Z"
    }
  ]
} as const;
