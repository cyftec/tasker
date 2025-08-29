import { phase } from "@mufw/maya/utils";
import { INITIAL_ANALYTICS } from "../constants";
import {
  areSameDates,
  getDaysGap,
  getHabitData,
  getHabitUI,
} from "../transforms";
import { Habit, HabitUI, LocalSettings, StorageDetails } from "../types";
import { fetchAnalytics, updateAnalytics } from "./analytics";
import {
  fetchHabitsFromStore,
  fetchHabitWithKey,
  getHabitStoreRecordKey,
  hardDeleteHabitFromStore,
  saveHabitInStore,
} from "./habits";
import { fetchSettings, getStorageSpaceData, updateSettings } from "./settings";

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
  const currentAnalytics = fetchAnalytics();
  return currentAnalytics.lastInteraction;
};

export const updateInteractionTime = (date: Date) => {
  const currentAnalytics = fetchAnalytics();
  updateAnalytics({
    ...currentAnalytics,
    lastInteraction: date.getTime(),
  });
};

/**
 *
 *
 *
 *    SETTINGS
 */

export const getHabitsPageSettings = (): LocalSettings["habitsPage"] => {
  const settings = fetchSettings();
  return settings.habitsPage;
};

export const updateHabitsPageSettings = (
  habitsPageSettings: LocalSettings["habitsPage"]
) => {
  const settings = fetchSettings();
  updateSettings({
    ...settings,
    habitsPage: habitsPageSettings,
  });
};

export const getEditPageSettings = (): LocalSettings["editPage"] => {
  const settings = fetchSettings();
  return settings.editPage;
};

export const updateEditPageSettings = (
  editPageSettings: LocalSettings["editPage"]
) => {
  const settings = fetchSettings();
  updateSettings({
    ...settings,
    editPage: editPageSettings,
  });
};

export const getStorageData = (): StorageDetails => getStorageSpaceData();

/**
 *
 *
 *
 *    HABITS
 */

export const fetchHabit = (habitId: number): HabitUI => {
  const habitID = getHabitStoreRecordKey(habitId);
  const habit = fetchHabitWithKey(habitID);

  if (!habit) throw `Error fetching habit with id '${habitId}' from storage`;
  return getHabitUI(habit);
};

export const fetchHabits = (): HabitUI[] => {
  const habits: Habit[] = fetchHabitsFromStore();
  return habits.map((habit) => getHabitUI(habit));
};

export const findHabit = (habitTitle: string): HabitUI | undefined => {
  const habits: Habit[] = fetchHabitsFromStore();
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

export const saveHabit = (habit: HabitUI) => {
  const habitData: Habit = getHabitData(habit);
  saveHabitInStore(habitData);
};
export const stopHabit = (habit: HabitUI) => {
  const updatedHabit: HabitUI = { ...habit, isStopped: true };
  saveHabit(updatedHabit);
};
export const deleteHabit = (habitId: number) =>
  hardDeleteHabitFromStore(habitId);
