import { InflatedStructuredRecord } from "../../../../_kvdb";
import {
  HabitLevel,
  HabitStatus,
  INITIAL_TRACKER,
  StatusTracker,
} from "./properties";

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
export const INITIAL_HABIT: Habit = {
  id: 0,
  isStopped: false,
  startDate: new Date(),
  title: "",
  colorIndex: 0,
  schedule: [true, true, true, true, true, true, true],
  levels: [],
  excuses: [],
  tracker: INITIAL_TRACKER,
  milestones: [70, 60, 45],
};
