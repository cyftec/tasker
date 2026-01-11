import {
  InflatedStructuredRecord,
  InflatedUnstructuredRecord,
} from "../../../../_kvdb";

export type HabitStatus = InflatedUnstructuredRecord<string>;
export const INITIAL_STATUSES: HabitStatus[] = [
  {
    id: 0,
    value: "Not started",
  },
  {
    id: 0,
    value: "Completed",
  },
];

export type HabitExcuse = InflatedUnstructuredRecord<string>;
export const INITIAL_EXCUSES: HabitExcuse[] = [
  {
    id: 0,
    value: "Away from home",
  },
  {
    id: 0,
    value: "Not well",
  },
  {
    id: 0,
    value: "Guests visiting home",
  },
];
export type StatusTracker = InflatedUnstructuredRecord<number[]>;
export const INITIAL_TRACKER: StatusTracker = {
  id: 0,
  value: [],
};

export type HabitLevel = InflatedStructuredRecord<{
  status: HabitStatus;
  points: number;
}>;
export const INITIAL_LEVEL: HabitLevel = {
  id: 0,
  status: INITIAL_STATUSES[0],
  points: 0,
};
