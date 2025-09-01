import { NumBoolean } from "@cyftec/kvdb";

// type LocalSettings = {
//   id: "local-settings";
//   habitsPage: {
//     tabIndex: number;
//     sortOptionIndex: number;
//   };
//   editPage: {
//     showHints: boolean;
//     showFullCustomisation: boolean;
//   };
// };

// type NavbarLink = {
//   label: string;
//   icon: string;
//   isSelected: boolean;
//   href: string;
// };

// type StorageDetails = {
//   total: number;
//   spaceLeft: number;
//   documents: Record<string, number>;
// };

// type Analytics = {
//   id: "analytics";
//   lastInteraction: number;
// };

// type MonthStatus = [
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number,
//   number
// ];

// type HabitPause = {
//   start: number;
//   end: number;
// };
type WeekdayFrequency = [
  NumBoolean,
  NumBoolean,
  NumBoolean,
  NumBoolean,
  NumBoolean,
  NumBoolean,
  NumBoolean
];
// type AchievedMilestone = {
//   label: string;
//   icon: string;
//   color: string;
// };
// type LevelCompletion = {
//   level: LevelUI;
//   count: number;
//   weightage: number;
//   percent: number;
// };
// type StoreHabitRecordKey = `h.${number}`;
// type Habit = {
//   id: number;
//   title: string;
//   frequency: WeekdayFrequency;
//   colorIndex: number;
//   levels: string[];
//   tracker: number[];
//   milestones: MilestonesData;
//   pauses: HabitPause[];
//   isStopped: boolean;
// };

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
