import { phase } from "@mufw/maya/utils";
import { HabitV0, StoreHabitRecordKey } from "../../models/v0";
import { parseObjectJsonString } from "../utils";
import { validLocalStorageKeys } from "./core";

export const validHabitRecordKey = (localStorageKey: string) =>
  localStorageKey.startsWith("h.");

export const getHabitStoreRecordKey = (habitId: number): StoreHabitRecordKey =>
  `h.${habitId}`;

export const fetchHabitWithKey = (
  localStorageKey: string
): HabitV0 | undefined => {
  if (!validHabitRecordKey(localStorageKey)) return;
  const habitJSON = localStorage.getItem(localStorageKey);
  const habit = parseObjectJsonString<HabitV0>(habitJSON, "title");
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

  const habits: HabitV0[] = [];
  for (const lsKey of validLocalStorageKeys()) {
    const habit = fetchHabitWithKey(lsKey);
    if (!habit) continue;
    habits.push(habit);
  }

  return habits;
};

export const saveHabitInStore = (habit: HabitV0) => {
  const habitID = getHabitStoreRecordKey(habit.id);
  localStorage.setItem(habitID, JSON.stringify(habit));
};

export const hardDeleteHabitFromStore = (habitId: number) => {
  const habitID = getHabitStoreRecordKey(habitId);
  localStorage.removeItem(habitID);
};
