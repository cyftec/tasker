import { openDb } from "../../_kvdb";
import {
  INITIAL_EXCUSES,
  INITIAL_HABIT,
  INITIAL_LEVEL,
  INITIAL_SETTINGS,
  INITIAL_STATUSES,
  INITIAL_TRACKER,
} from "../../models/v1/data-models";
import { fromV0ToV1 } from "./migrations/fromV0";

const SETTINGS_TABLE_KEY = "sett";
const HABIT_STATUSES_TABLE_KEY = "hs";
const HABIT_EXCUSES_TABLE_KEY = "hx";
const HABIT_LEVELS_TABLE_KEY = "hl";
const STATUS_TRACKERS_TABLE_KEY = "ht";
const HABITS_TABLE_KEY = "hh";

export const dbschema = {
  settings: {
    key: SETTINGS_TABLE_KEY,
    newItem: INITIAL_SETTINGS,
    type: "monolith",
  },
  habitExcuses: {
    key: HABIT_EXCUSES_TABLE_KEY,
    newItem: INITIAL_EXCUSES[0],
    type: "distinct",
    mappings: {},
  },
  habitStatuses: {
    key: HABIT_STATUSES_TABLE_KEY,
    newItem: INITIAL_STATUSES[0],
    type: "distinct",
    mappings: {},
  },
  habitTrackers: {
    key: STATUS_TRACKERS_TABLE_KEY,
    newItem: INITIAL_TRACKER,
    type: "distinct",
    mappings: {},
  },
  habitLevels: {
    key: HABIT_LEVELS_TABLE_KEY,
    newItem: INITIAL_LEVEL,
    type: "structured",
    mappings: {
      status: {
        type: "foreigntable",
        tableKey: HABIT_STATUSES_TABLE_KEY,
        owned: false,
      },
    },
  },
  habits: {
    key: HABITS_TABLE_KEY,
    newItem: INITIAL_HABIT,
    type: "structured",
    mappings: {
      isStopped: { type: "bool" },
      schedule: { type: "bool" },
      startDate: { type: "date" },
      levels: {
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
const flatDb = openDb(dbschema, 1, fromV0ToV1);

export const db = {
  _meta: flatDb._meta,
  settings: flatDb.settings,
  habits: {
    statuses: flatDb.habitStatuses,
    excuses: flatDb.habitExcuses,
    levels: flatDb.habitLevels,
    trackers: flatDb.habitTrackers,
    list: flatDb.habits,
  },
};
