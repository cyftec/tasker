import { InflatedStructuredRecord } from "../../../../_kvdb";
import { HabitLevel, HabitStatus, StatusTracker } from "./properties";

export type WeekSchedule = [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
];

type Milestones = [number, number, number];

export type Habit = InflatedStructuredRecord<{
  isStopped: boolean;
  startDate: Date;
  title: string;
  colorIndex: number;
  schedule: WeekSchedule;
  levels: HabitLevel[];
  excuses: HabitStatus[];
  tracker: StatusTracker;
  milestones: Milestones;
}>;
