export type MilestoneVM = {
  label: string;
  upperLimit: number;
  percent: number;
  icon: string;
  color: string;
};

export type MilestonesVM = [MilestoneVM, MilestoneVM, MilestoneVM, MilestoneVM];
