import { AnalyticsV0, HabitV0, SettingsV0 } from "../../../models/v0";
import {
  Habit,
  HabitLevel,
  HabitStatus,
  Settings,
  StatusTracker,
  WeekSchedule,
} from "../../../models/v1/data-models";
import { db } from "../db";

const getSettingsV1 = (
  analyticsV0Key: string,
  settingsV0Key: string
): Settings => {
  const analyticsV0 = JSON.parse(
    localStorage.getItem(analyticsV0Key) || ""
  ) as AnalyticsV0;
  const settingsV0 = JSON.parse(
    localStorage.getItem(settingsV0Key) || ""
  ) as SettingsV0;
  return {
    id: 0,
    value: {
      analytics: {
        lastInteraction: analyticsV0.lastInteraction,
      },
      editPage: settingsV0.editPage,
      habitsPage: settingsV0.habitsPage,
    },
  };
};

const getHabitV1 = (habitV0Key: string): Habit => {
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

export const isCurrentVersionV0 = (): boolean => {
  const analyticsV0 = localStorage.getItem("analytics");
  if (analyticsV0) return true;
  return false;
};

export const fromV0ToV1 = () => {
  if (!globalThis.localStorage) return;
  if (!isCurrentVersionV0()) return;

  let migrationSuccessful = false;
  const oldDbBackup: Record<string, string> = {};

  const settings: Settings = getSettingsV1("analytics", "settings");
  const habits: Habit[] = [];
  for (const key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) continue;
    oldDbBackup[key] = localStorage.getItem(key) || "";
    if (key.startsWith("h.")) {
      habits.push(getHabitV1(key));
    }
  }

  localStorage.clear();
  try {
    db.settings.add(settings);
    habits.forEach((habit) => db.habits.list.add(habit));
    migrationSuccessful = true;
  } catch (error) {
    console.log(error);
  }

  if (migrationSuccessful) return;
  for (let key in oldDbBackup) {
    localStorage.setItem(key, oldDbBackup[key]);
  }
};
