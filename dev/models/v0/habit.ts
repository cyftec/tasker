export type WeekScheduleV0 = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];

export type Milestones = [number, number, number];

export type HabitV0 = {
  id: number;
  isStopped: boolean;
  startDate: Date;
  title: string;
  colorIndex: number;
  frequency: WeekScheduleV0;
  levels: string[];
  tracker: number[];
  milestones: Milestones;
};
