import { AnalyticsV0, HabitV0, SettingsV0 } from "../../../models/v0";
import {
  Analytics,
  Habit,
  HabitLevel,
  HabitStatus,
  PageName,
  Setting,
  StatusTracker,
  WeekSchedule,
} from "../../../models/v1/data-models";
import { db } from "../db";

const getHabitV1 = (habitV0Key: string) => {
  const habitV0 = JSON.parse(localStorage.getItem(habitV0Key) || "") as HabitV0;
  if (!habitV0) throw `Habit of version 0 is either corrupted or failing.`;
  const statuses: HabitStatus[] = habitV0.levels.map((l, i) => {
    return { id: 0, value: l };
  });
  const levels: HabitLevel[] = statuses.map((s, i) => ({
    id: 0,
    status: s,
    points: i,
  }));
  const tracker: StatusTracker = { id: 0, value: habitV0.tracker };
  const habit: Habit = {
    ...habitV0,
    schedule: habitV0.frequency.map((f) => !!f) as WeekSchedule,
    levels,
    excuses: [],
    tracker,
    id: 0,
  };
  // @ts-ignore
  delete (habit as unknown as HabitV0).frequency;
  // @ts-ignore
  delete (habit as unknown as HabitV0).pauses;
  return habit;
};

const getSettings = (settingsV0Key: string) => {
  const settingsV0 = JSON.parse(
    localStorage.getItem(settingsV0Key) || ""
  ) as SettingsV0;
  const settings: Setting<PageName>[] = Object.entries(settingsV0)
    .map(([key, value]) => {
      if (key === "id") return;
      return {
        id: 0,
        page: key as PageName,
        data: value as Setting<PageName>["data"],
      };
    })
    .filter((s) => !!s);
  return settings;
};

const getAnalytics = (analyticsV0Key: string): Analytics => {
  const analyticsV0 = JSON.parse(
    localStorage.getItem(analyticsV0Key) || ""
  ) as AnalyticsV0;
  return { id: 0, value: { lastInteraction: analyticsV0.lastInteraction } };
};

export const getCurrentVersion = () => {
  // check version v0
  const settingsString = localStorage.getItem("settings");
  if (settingsString) {
    const settings = JSON.parse(settingsString);
    if (settings && (settings.editPage || settings.habitsPage)) return "v0";
  }

  // check version v1
  // if()

  if (!localStorage.length) return "new";

  return "unknown";
};

export const fromV0ToV1 = () => {
  if (!globalThis.localStorage) return;
  const currentVersion = getCurrentVersion();
  console.log(`current version is - ${currentVersion}`);
  if (currentVersion !== "v0") return;
  const oldDB: Record<string, string> = {};
  const habits: Habit[] = [];
  const settings: Setting<PageName>[] = [];
  let migrationSuccessful = false;
  let analytics: Analytics = {
    id: 0,
    value: { lastInteraction: new Date().getTime() },
  };

  for (const key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) continue;
    oldDB[key] = localStorage.getItem(key) || "";
    // localStorage.removeItem(key);
  }

  for (let key in oldDB) {
    if (key === "settings") {
      getSettings(key).forEach((s) => settings.push(s));
    } else if (key === "analytics") {
      analytics = getAnalytics(key);
    } else if (key.startsWith("h.")) {
      habits.push(getHabitV1(key));
    } else {
      console.log(`Unknown key found in localStorage - '${key}'`);
    }
  }

  try {
    localStorage.clear();
    // TODO: implement singleton to avoid duplicate add
    db.analytics.put(analytics);
    settings.forEach((setting) => db.settings.put(setting));
    habits.forEach((habit) => db.habits.list.put(habit));
    migrationSuccessful = true;
  } catch (error) {
    console.log(error);
  }

  if (!migrationSuccessful) {
    localStorage.clear();
    for (let key in oldDB) {
      localStorage.setItem(key, oldDB[key]);
    }
  }
};
