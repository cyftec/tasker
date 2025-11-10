import {
  InflatedStructuredRecord,
  InflatedUnstructuredRecord,
} from "../../../../_kvdb";

export type HabitStatus = InflatedUnstructuredRecord<string>;

export type HabitExcuse = InflatedUnstructuredRecord<string>;

export type StatusTracker = InflatedUnstructuredRecord<number[]>;

export type HabitLevel = InflatedStructuredRecord<{
  status: HabitStatus;
  points: number;
}>;
