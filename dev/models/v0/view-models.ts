import { WeekScheduleV0 } from "./habit";

export type NavbarLink = {
  label: string;
  icon: string;
  isSelected: boolean;
  href: string;
};

export type MonthStatus = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export type StoreHabitRecordKey = `h.${number}`;

export type LevelVM = {
  isMaxLevel: boolean;
  name: string;
  code: number;
};

export type AchievedMilestone = {
  label: string;
  icon: string;
  color: string;
};

export type LevelCompletion = {
  level: LevelVM;
  count: number;
  weightage: number;
  percent: number;
};

export type DailyStatus = {
  level: LevelVM;
  date: Date;
};
type Milestone = {
  label: string;
  upperLimit: number;
  percent: number;
  icon: string;
  color: string;
};

export type MilestonesVM = [Milestone, Milestone, Milestone, Milestone];

export type HabitVM = {
  id: number;
  startDate: Date;
  title: string;
  frequency: WeekScheduleV0;
  colorIndex: number;
  levels: LevelVM[];
  tracker: DailyStatus[];
  milestones: MilestonesVM;
  isStopped: boolean;
};
