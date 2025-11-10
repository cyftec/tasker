import {
  AnalyticsV0,
  LevelVM,
  SettingsV0,
  Milestones,
  StorageDetails,
  WeekScheduleV0,
} from "../models/v0";

export const APP_VERSION = "1.3.0";

export const BASE_COLORS = [
  `#e87b52`,
  `#F5E06F`,
  `#A3BA64`,
  `#7095C9`,
  `#A59EE3`,
  `#D89DBF`,
] as const satisfies string[];

export const BASE_WEEKDAY_FREQUENCY: WeekScheduleV0 = [1, 1, 1, 1, 1, 1, 1];

export const SYSTEM_DEFINED_LEVELS: LevelVM[] = [
  {
    name: "Not Applicable",
    code: -1,
    isMaxLevel: false,
  },
  {
    name: "Paused",
    code: -2,
    isMaxLevel: false,
  },
  {
    name: "Stopped",
    code: -3,
    isMaxLevel: false,
  },
];
export const BASE_LEVELS = [
  "Not started",
  "Completed",
] as const satisfies string[];

export const BASE_MILESTONES: Milestones = [70, 60, 45];

export const INITIAL_ANALYTICS: AnalyticsV0 = {
  id: "analytics",
  lastInteraction: new Date().getTime(),
};

export const INITIAL_SETTINGS: SettingsV0 = {
  id: "local-settings",
  habitsPage: {
    tabIndex: 0,
    sortOptionIndex: 0,
  },
  editPage: {
    showHints: true,
    showFullCustomisation: false,
  },
};

export const INITIAL_STORAGE_DATA: StorageDetails = {
  total: 0,
  spaceLeft: 100,
  documents: {},
};

export const HOMEPAGE_OVERVIEW_TABS = [
  { label: "This month", months: 1 },
  { label: "2 months", months: 2 },
  { label: "5 months", months: 5 },
] as const;

export const HOMEPAGE_SORT_OPTIONS = [
  {
    icon: "calendar_month",
    decending: true,
    label: "Date created (Newest first)",
  },
  {
    icon: "calendar_month",
    decending: false,
    label: "Date created (Oldest first)",
  },
  {
    icon: "task_alt",
    decending: true,
    label: "Completion (Highest first)",
  },
  {
    icon: "task_alt",
    decending: false,
    label: "Completion (Lowest first)",
  },
] as const satisfies object[];
