export type LocalSettings = {
  id: "local-settings";
  habitsPage: {
    tabIndex: number;
    sortOptionIndex: number;
  };
  editPage: {
    showHints: boolean;
    showFullCustomisation: boolean;
  };
};

export type NavbarLink = {
  label: string;
  icon: string;
  isSelected: boolean;
  href: string;
};

export type StorageDetails = {
  total: number;
  spaceLeft: number;
  documents: Record<string, number>;
};

export type Analytics = {
  id: "analytics";
  lastInteraction: number;
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

export type HabitPause = {
  start: number;
  end: number;
};
export type WeekdayFrequency = [
  0 | 1,
  0 | 1,
  0 | 1,
  0 | 1,
  0 | 1,
  0 | 1,
  0 | 1
];
export type MilestonesData = [number, number, number];
export type MilestonesUI = [Milestone, Milestone, Milestone, Milestone];
export type Milestone = {
  label: string;
  upperLimit: number;
  percent: number;
  icon: string;
  color: string;
};
export type AchievedMilestone = {
  label: string;
  icon: string;
  color: string;
};
export type LevelCompletion = {
  level: LevelUI;
  count: number;
  weightage: number;
  percent: number;
};
export type StoreHabitRecordKey = `h.${number}`;
export type Habit = {
  id: number;
  title: string;
  frequency: WeekdayFrequency;
  colorIndex: number;
  levels: string[];
  tracker: number[];
  milestones: MilestonesData;
  pauses: HabitPause[];
  isStopped: boolean;
};

export type LevelUI = {
  isMaxLevel: boolean;
  name: string;
  code: number;
};

export type DailyStatus = {
  key: number;
  level: LevelUI;
  date: Date;
};

export type HabitUI = {
  id: number;
  startDate: Date;
  title: string;
  frequency: WeekdayFrequency;
  colorIndex: number;
  levels: LevelUI[];
  tracker: DailyStatus[];
  milestones: MilestonesUI;
  pauses: HabitPause[];
  isStopped: boolean;
};
