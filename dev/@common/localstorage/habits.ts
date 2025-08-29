import { phase } from "@mufw/maya/utils";
import { Habit, StoreHabitRecordKey } from "../types";
import { parseObjectJsonString } from "../utils";
import { validLocalStorageKeys } from "./core";

export const validHabitRecordKey = (localStorageKey: string) =>
  localStorageKey.startsWith("h.");

export const getHabitStoreRecordKey = (habitId: number): StoreHabitRecordKey =>
  `h.${habitId}`;

export const fetchHabitWithKey = (
  localStorageKey: string
): Habit | undefined => {
  if (!validHabitRecordKey(localStorageKey)) return;
  const habitJSON = localStorage.getItem(localStorageKey);
  const habit = parseObjectJsonString<Habit>(habitJSON, "title");
  if (!habit) return;
  return habit;
};

export const checkNoHabitsInStore = () => {
  for (const lsKey of validLocalStorageKeys()) {
    if (validHabitRecordKey(lsKey)) return false;
  }

  return true;
};

export const fetchHabitsFromStore = () => {
  if (!phase.currentIs("run")) return [];

  const habits: Habit[] = [];
  for (const lsKey of validLocalStorageKeys()) {
    const habit = fetchHabitWithKey(lsKey);
    if (!habit) continue;
    habits.push(habit);
  }

  return habits;
};

export const saveHabitInStore = (habit: Habit) => {
  const habitID = getHabitStoreRecordKey(habit.id);
  localStorage.setItem(habitID, JSON.stringify(habit));
};

export const hardDeleteHabitFromStore = (habitId: number) => {
  const habitID = getHabitStoreRecordKey(habitId);
  localStorage.removeItem(habitID);
};
