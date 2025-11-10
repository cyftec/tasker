import { phase } from "@mufw/maya/utils";
import { INITIAL_ANALYTICS } from "../constants";
import {
  areSameDates,
  getDaysGap,
  getHabitData,
  getHabitUI,
} from "../transforms";
import { HabitV0, HabitVM, SettingsV0, StorageDetails } from "../../models/v0";
import { fetchAnalytics, updateAnalytics } from "./analytics";
import {
  fetchHabitsFromStore,
  fetchHabitWithKey,
  getHabitStoreRecordKey,
  hardDeleteHabitFromStore,
  saveHabitInStore,
} from "./habits";
import { fetchSettings, getStorageSpaceData, updateSettings } from "./settings";
import { Setting } from "../../models/v1/data-models";
import { db } from "../databases/db";

/**
 *
 *
 *
 *    ANALYTICS
 */

export const getLastInteraction = () => {
  if (!phase.currentIs("run")) {
    return INITIAL_ANALYTICS.lastInteraction;
  }
  const [analytics] = db.analytics.get();
  if (!analytics) throw `Failed to fetch analytics from DB`;
  return analytics.value.lastInteraction;
};

export const updateInteractionTime = (date: Date) => {
  const [analytics] = db.analytics.get();
  if (!analytics) throw `Failed to fetch analytics from DB`;
  console.log(analytics);
  const updated = {
    ...analytics,
    value: { lastInteraction: date.getTime() },
  };
  console.log(updated);
  db.analytics.put(updated);
};

/**
 *
 *
 *
 *    SETTINGS
 */

export const getHabitsPageSettings = (): Setting<"habitsPage">["data"] => {
  const settings = db.settings.find((s) => s.page === "habitsPage");
  if (!settings) throw `Failed to fetch habits-page settings from DB`;
  return settings.data as Setting<"habitsPage">["data"];
};

export const updateHabitsPageSettings = (
  habitsPageSettingsData: Setting<"habitsPage">["data"]
) => {
  const settings = db.settings.find((s) => s.page === "habitsPage");
  if (!settings) throw `Failed to fetch habits-page settings from DB`;
  db.settings.put({ ...settings, ...habitsPageSettingsData });
};

export const getEditPageSettings = (): Setting<"editPage">["data"] => {
  const settings = db.settings.find((s) => s.page === "editPage");
  if (!settings) throw `Failed to fetch edit-page settings from DB`;
  return settings.data as Setting<"editPage">["data"];
};

export const updateEditPageSettings = (
  editPageSettingsData: Setting<"editPage">["data"]
) => {
  const settings = db.settings.find((s) => s.page === "editPage");
  if (!settings) throw `Failed to fetch edit-page settings from DB`;
  db.settings.put({ ...settings, ...editPageSettingsData });
};

export const getStorageData = (): StorageDetails => getStorageSpaceData();

/**
 *
 *
 *
 *    HABITS
 */

export const fetchHabit = (habitId: number): HabitVM => {
  const habitID = getHabitStoreRecordKey(habitId);
  const habit = fetchHabitWithKey(habitID);

  if (!habit) throw `Error fetching habit with id '${habitId}' from storage`;
  return getHabitUI(habit);
};

export const fetchHabits = (): HabitVM[] => {
  const habits: HabitV0[] = fetchHabitsFromStore();
  return habits.map((habit) => getHabitUI(habit));
};

export const findHabit = (habitTitle: string): HabitVM | undefined => {
  const habits: HabitV0[] = fetchHabitsFromStore();
  const foundHabit = habits.find(
    (habit) => habit.title.trim() === habitTitle.trim()
  );

  return foundHabit ? getHabitUI(foundHabit) : undefined;
};

export const intializeTrackerEmptyDays = () => {
  const habits = fetchHabitsFromStore();
  for (let habit of habits) {
    const day1 = new Date(habit.id);
    const today = new Date();
    const daysGap = getDaysGap(day1, today);
    const updatedTracker = [...habit.tracker];
    if (daysGap + 2 <= updatedTracker.length) continue;

    /**
     * A scenario where today's weekday was not added in
     * the schedule earlier but is changed now. Since today
     * is not in the habit scheduled weekday, it should be eligible
     * to get initialized.
     *
     * Earlier when a day set as -1 or lower, the day was simply
     * not modifiable.
     */
    const lastStatusIndex = updatedTracker.length - 1;
    const lastStatusDay = new Date(
      day1.getFullYear(),
      day1.getMonth(),
      day1.getDate() + lastStatusIndex
    );
    const lastStatusDayOfWeek = lastStatusDay.getDay();
    if (areSameDates(today, lastStatusDay)) {
      const lastStatus = updatedTracker[lastStatusIndex];
      updatedTracker[lastStatusIndex] = habit.frequency[lastStatusDayOfWeek]
        ? lastStatus < 0
          ? 0
          : lastStatus
        : -1;
    }

    for (let i = updatedTracker.length; i <= daysGap; i++) {
      const day = new Date(
        day1.getFullYear(),
        day1.getMonth(),
        day1.getDate() + i
      );
      const dayOfWeek = day.getDay();
      updatedTracker[i] = habit.frequency[dayOfWeek] ? 0 : -1;
    }
    habit.tracker = updatedTracker;
    saveHabitInStore(habit);
  }
};

export const saveHabit = (habit: HabitVM) => {
  const habitData: HabitV0 = getHabitData(habit);
  saveHabitInStore(habitData);
};
export const stopHabit = (habit: HabitVM) => {
  const updatedHabit: HabitVM = { ...habit, isStopped: true };
  saveHabit(updatedHabit);
};
export const deleteHabit = (habitId: number) =>
  hardDeleteHabitFromStore(habitId);
