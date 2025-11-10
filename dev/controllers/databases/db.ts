import { openDb, DatabaseSchema } from "../../_kvdb";
import {
  Analytics,
  Habit,
  HabitExcuse,
  HabitLevel,
  HabitStatus,
  Setting,
  Settings,
  StatusTracker,
} from "../../models/v1/data-models";
import { fromV0ToV1 } from "./migrations/fromV0";

const ANALYTICS_TABLE_KEY = "anal";
const SETTINGS_TABLE_KEY = "sett";
const HABIT_STATUSES_TABLE_KEY = "hs";
const HABIT_EXCUSES_TABLE_KEY = "hx";
const HABIT_LEVELS_TABLE_KEY = "hl";
const STATUS_TRACKERS_TABLE_KEY = "ht";
const HABITS_TABLE_KEY = "hh";

export const dbschema = {
  analytics: {
    key: ANALYTICS_TABLE_KEY,
    structure: {} as Analytics,
    type: "unstructured",
  },
  settings: {
    key: SETTINGS_TABLE_KEY,
    structure: {} as Setting<keyof Settings>,
    type: "structured",
  },
  habitStatuses: {
    key: HABIT_STATUSES_TABLE_KEY,
    structure: {} as HabitStatus,
    type: "unstructured",
    mappings: {},
  },
  habitExcuses: {
    key: HABIT_EXCUSES_TABLE_KEY,
    structure: {} as HabitExcuse,
    type: "unstructured",
    mappings: {},
  },
  habitLevels: {
    key: HABIT_LEVELS_TABLE_KEY,
    structure: {} as HabitLevel,
    type: "structured",
    mappings: {
      status: {
        type: "foreigntable",
        tableKey: HABIT_STATUSES_TABLE_KEY,
        owned: false,
      },
    },
  },
  habitTrackers: {
    key: STATUS_TRACKERS_TABLE_KEY,
    structure: {} as StatusTracker,
    type: "unstructured",
    mappings: {},
  },
  habits: {
    key: HABITS_TABLE_KEY,
    structure: {} as Habit,
    type: "structured",
    mappings: {
      isStopped: { type: "bool" },
      schedule: { type: "bool" },
      startDate: { type: "date" },
      "levels.status": {
        type: "foreigntable",
        tableKey: HABIT_STATUSES_TABLE_KEY,
        owned: false,
      },
      excuses: {
        type: "foreigntable",
        tableKey: HABIT_EXCUSES_TABLE_KEY,
        owned: false,
      },
      tracker: {
        type: "foreigntable",
        tableKey: STATUS_TRACKERS_TABLE_KEY,
        owned: true,
      },
    },
  },
} as const;
const flatDb = openDb(dbschema, fromV0ToV1);

export const db = {
  settings: flatDb.settings,
  analytics: flatDb.analytics,
  habits: {
    statuses: flatDb.habitStatuses,
    excuses: flatDb.habitExcuses,
    levels: flatDb.habitLevels,
    trackers: flatDb.habitTrackers,
    list: flatDb.habits,
  },
};
