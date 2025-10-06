import { NumBoolean } from "@cyftec/kvdb";

type WeekdayFrequency = [
  NumBoolean,
  NumBoolean,
  NumBoolean,
  NumBoolean,
  NumBoolean,
  NumBoolean,
  NumBoolean
];

type LevelUI = {
  isMaxLevel: boolean;
  name: string;
  code: number;
};

type DailyStatus = {
  key: number;
  level: LevelUI;
  date: Date;
};
type Milestone = {
  label: string;
  upperLimit: number;
  percent: number;
  icon: string;
  color: string;
};
type MilestonesUI = [Milestone, Milestone, Milestone, Milestone];

export type HabitUI = {
  id: number;
  startDate: Date;
  title: string;
  frequency: WeekdayFrequency;
  colorIndex: number;
  levels: LevelUI[];
  tracker: DailyStatus[];
  milestones: MilestonesUI;
  isStopped: boolean;
};
