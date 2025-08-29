import {
  BASE_COLORS,
  BASE_LEVELS,
  BASE_MILESTONES,
  BASE_WEEKDAY_FREQUENCY,
  HOMEPAGE_SORT_OPTIONS,
  SYSTEM_DEFINED_LEVELS,
} from "../constants";
import {
  fetchHabit,
  fetchHabits,
  findHabit,
  getLastInteraction,
  saveHabit,
} from "../localstorage";
import {
  AchievedMilestone,
  DailyStatus,
  Habit,
  HabitUI,
  LevelCompletion,
  LevelUI,
  MilestonesData,
  MilestonesUI,
  NavbarLink,
} from "../types";
import { getQueryParamValue } from "../utils/navigation";
import {
  areSameDates,
  getDateGapFromToday,
  getDatesArrayBetweenDates,
  getDateWindow,
  getDaysGap,
  getGapDate,
  getMinutesInMS,
  getMomentZero,
  getMomentZeroDate,
  getSaturday,
  getSunday,
} from "./date-time";

const GOLDEN_RATIO = 1.6181;

export const getHabitFromUrl = (): HabitUI | undefined => {
  const idString = getQueryParamValue("id");
  const id = +idString;
  if (isNaN(id) || !id) return;

  try {
    return fetchHabit(id);
  } catch (errMsg) {
    return;
  }
};

export const getSystemDefinedLevel = (levelCode: number) =>
  SYSTEM_DEFINED_LEVELS.find((sysLevel) => sysLevel.code === levelCode);

export const getLevelUI = (level: number, levels: string[]): LevelUI => {
  return level < 0
    ? (getSystemDefinedLevel(-1) as LevelUI)
    : {
        isMaxLevel: level === levels.length - 1,
        name: levels[level],
        code: level,
      };
};

export const getEmptyDailyStatus = (date: Date): DailyStatus => ({
  key: date.getTime(),
  level: getLevelUI(-1, []),
  date: date,
});

export const getDailyStatus = (
  level: number,
  levels: string[],
  date: Date
): DailyStatus => ({
  key: date.getTime(),
  level: getLevelUI(level, levels),
  date: date,
});

export const getDayStatus = (tracker: DailyStatus[], date: Date) =>
  tracker.find((status) => areSameDates(status.date, date));

export const getHabitsForDate = (date: Date): HabitUI[] =>
  fetchHabits().filter((hab) => {
    const isNotStopped = !hab.isStopped;
    const weekdayScheduleMatches = hab.frequency[date.getDay()];
    const dateNotOutsideExistence =
      getMomentZero(date) >= getMomentZero(new Date(hab.id));
    return isNotStopped && weekdayScheduleMatches && dateNotOutsideExistence;
  });

export const getHabitUI = (habit: Habit): HabitUI => {
  const startDate = getMomentZeroDate(new Date(habit.id));
  return {
    ...habit,
    startDate,
    levels: habit.levels.map((levelName, index) => ({
      isMaxLevel: index === habit.levels.length - 1,
      name: levelName,
      code: index,
    })),
    tracker: habit.tracker.map((status, i) =>
      getDailyStatus(status, habit.levels, getGapDate(startDate, i))
    ),
    milestones: getMilestonesUI(habit.milestones),
  };
};

export const getHabitData = (uiHabit: HabitUI): Habit => {
  return {
    ...uiHabit,
    levels: uiHabit.levels.map((level) => level.name),
    tracker: uiHabit.tracker.map((status, i) => status.level.code),
    milestones: getMilestonesData(uiHabit.milestones),
  };
};

export const getNewHabit = (): HabitUI => {
  const now = new Date().getTime();
  const habit: Habit = {
    id: now,
    title: "",
    frequency: BASE_WEEKDAY_FREQUENCY,
    colorIndex: 0,
    levels: BASE_LEVELS,
    tracker: [],
    milestones: BASE_MILESTONES,
    pauses: [],
    isStopped: false,
  };

  return getHabitUI(habit);
};

export const getMilestonesUI = (milestones: MilestonesData): MilestonesUI => [
  {
    label: "Successful",
    upperLimit: 100,
    percent: milestones[0],
    icon: "verified_user",
    color: "green",
  },
  {
    label: "Little more to go",
    upperLimit: milestones[0],
    percent: milestones[1],
    icon: "done_all",
    color: "light-blue",
  },
  {
    label: "Going good",
    upperLimit: milestones[1],
    percent: milestones[2],
    icon: "check",
    color: "blue",
  },
  {
    label: "Unacceptable",
    upperLimit: milestones[2],
    percent: 0,
    icon: "close",
    color: "red",
  },
];

export const getMilestonesData = (milestones: MilestonesUI): MilestonesData =>
  milestones
    .filter((ms) => !!ms.percent)
    .map((ms) => ms.percent) as MilestonesData;

export const getAchievedMilestone = (
  allMilestones: MilestonesUI,
  completionPercentage: number
): AchievedMilestone => {
  let milestone = allMilestones[0];
  for (let i = 0; i < allMilestones.length; i++) {
    milestone = allMilestones[i];
    if (milestone.percent <= completionPercentage) break;
  }
  return {
    label: milestone.label,
    icon: milestone.icon,
    color: milestone.color,
  };
};

export const getHabitValidationError = (
  habit: HabitUI,
  editingNewHabit?: boolean
): string => {
  if (!habit.title) {
    return "Title should not be empty";
  }
  if (editingNewHabit && findHabit(habit.title)) {
    return `A habit with same name already exists`;
  }
  if (habit.frequency.every((day) => !day)) {
    return "Select at least one day in a week";
  }
  if (!habit.levels.every((level) => !!level.name)) {
    return "One of the levels is empty";
  }
  const duplicateLevel = habit.levels.some((level, i) => {
    for (let j = i + 1; j < habit.levels.length; j++) {
      if (habit.levels[j].name === level.name) return true;
    }
    return false;
  });
  if (duplicateLevel) {
    return "Multiple levels have same name";
  }
  if (!habit.milestones.every((m) => m.percent <= 100 && m.percent >= 0)) {
    return `The milestones should be between 0 and 100 percents`;
  }
  if (
    !habit.milestones.every((m, i, ms) =>
      i === 0 ? true : ms[i - 1].percent > m.percent
    )
  ) {
    return `Milestones should be in order (from high to low)`;
  }

  return "";
};

export const getCompletion = (
  habit: HabitUI,
  startDate: Date,
  endDate: Date
) => {
  const habitTracker = getHabitStatusBetweenDates(
    habit.tracker,
    startDate,
    endDate
  );

  const totalStatusLevels = habit.levels.length - 1;
  let totalDays = 0;
  let workingDays = 0;
  let completion = 0;
  let aceStreak = 0;
  let followStreak = 0;
  let missed = 0;

  habitTracker.forEach((status, i) => {
    totalDays += status.level.code > -1 ? 1 : 0;
    workingDays += status.level.code > 0 ? 1 : 0;
    completion += status.level.code > 0 ? status.level.code : 0;

    const isLastEntry = i === habitTracker.length - 1;
    if (isLastEntry) return;

    const streakBroken = status.level.code < 1;
    missed = streakBroken ? missed + 1 : 0;

    const effectiveStatusCode = status.level.code > 0 ? status.level.code : 0;
    const statusGoodnessPercent =
      100 * (effectiveStatusCode / (habit.levels.length - 1));
    const goodWork = Math.round(statusGoodnessPercent) > 50;
    aceStreak = goodWork ? aceStreak + 1 : 0;
    followStreak = streakBroken ? 0 : followStreak + 1;
  });

  return {
    title: habit.title,
    aceStreak,
    followStreak,
    missed,
    percent: Math.round(100 * (completion / (totalDays * totalStatusLevels))),
    totalDays,
    workingDays,
  };
};

export const getAddRemoveButtonsVisibility = (
  oldLevels: LevelUI[],
  updatedLevels: LevelUI[],
  currentLevelIndex: number
) => {
  const oldLevelsExist = !!oldLevels.length;
  if (!oldLevelsExist)
    return {
      hideAddButton: false,
      hideRemoveButton: updatedLevels.length < 3,
    };

  const currentLevel = updatedLevels[currentLevelIndex];
  const currentLevelIsOld = !!(
    oldLevelsExist && oldLevels.find((ol) => ol.name === currentLevel.name)
  );
  const lengthMismatch = oldLevels.length !== updatedLevels.length;
  const levelsRemoved = updatedLevels.length < oldLevels.length;
  const levelsAdded = updatedLevels.length > oldLevels.length;
  const levelsNamesMismatch =
    !lengthMismatch &&
    oldLevels.length &&
    oldLevels.some((lvl, i) => lvl.name !== updatedLevels[i].name);

  const hideAddButton =
    levelsRemoved ||
    levelsNamesMismatch ||
    (currentLevelIsOld && levelsRemoved);
  const hideRemoveButton =
    levelsRemoved || levelsNamesMismatch || (currentLevelIsOld && levelsAdded);

  return { hideAddButton, hideRemoveButton };
};

export const levelTextboxDisability = (
  oldLevels: LevelUI[],
  updatedLevels: LevelUI[],
  currentLevelIndex: number
) => {
  const oldLevelsExist = !!oldLevels.length;
  const currentLevel = updatedLevels[currentLevelIndex];
  const currentLevelIsOld = !!(
    oldLevelsExist && oldLevels.find((ol) => ol.name === currentLevel.name)
  );
  const lengthMismatch = oldLevels.length !== updatedLevels.length;
  return currentLevelIsOld && lengthMismatch;
};

export const getColorsForLevel = (
  level: number,
  totalLevels: number,
  colorIndex: number,
  showText = false
) => {
  const color = BASE_COLORS[colorIndex];
  const levelFraction = level / (totalLevels - 1);
  const opacityHexNum = Math.trunc(Math.pow(levelFraction, GOLDEN_RATIO) * 255);
  const hex = opacityHexNum.toString(16);
  const opacityHex = hex.length === 1 ? `0${hex}` : hex;
  const backgroundColor =
    level < 0 || opacityHex === "0" ? "transparent" : `${color}${opacityHex}`;
  const fontColor = showText
    ? level / (totalLevels - 1) > 0.5
      ? "white"
      : "black"
    : level < 0
    ? "lightgray"
    : "transparent";

  return {
    backgroundColor,
    fontColor,
    peakBackgroundColor: color,
    levelPercent: Math.round(levelFraction * 100),
  };
};

export const updateHabitStatus = (
  habit: HabitUI,
  levelCode: number,
  date: Date
) => {
  const oldHabit = fetchHabit(habit.id);
  const updatedTracker = oldHabit.tracker.map((status) => {
    if (areSameDates(status.date, date)) {
      return { ...status, level: { ...status.level, code: levelCode } };
    }
    return status;
  });
  const updatedHabit = { ...oldHabit, tracker: updatedTracker };
  saveHabit(updatedHabit);
};

export const getHabitStatusForDates = (
  habitTracker: DailyStatus[],
  dates: Date[]
): DailyStatus[] => {
  const emptyFilledStatusTracker: DailyStatus[] = [];
  /* Improve this 2D traversal and matching in future.
   * It's just for the time being and is too heavy.
   */
  for (const date of dates) {
    const statusExistsForDate = habitTracker.some((status) => {
      const statusExists = areSameDates(status.date, date);
      if (statusExists) {
        emptyFilledStatusTracker.push(status);
        return true;
      }
      return false;
    });

    if (!statusExistsForDate)
      emptyFilledStatusTracker.push(getEmptyDailyStatus(date));
  }

  return emptyFilledStatusTracker;
};

export const getHabitStatusBetweenDates = (
  habitTracker: DailyStatus[],
  startDate: Date,
  endDate: Date
): DailyStatus[] => {
  const dates = getDatesArrayBetweenDates(startDate, endDate);
  return getHabitStatusForDates(habitTracker, dates);
};

export const getFullWeekStatusFilled = (habit: HabitUI) => {
  const firstSunday = getSunday(new Date(habit.id));
  const lastSaturday = getSaturday(new Date());
  const fullWeekTracker = getHabitStatusBetweenDates(
    habit.tracker,
    firstSunday,
    lastSaturday
  );
  return { ...habit, tracker: fullWeekTracker };
};

export const getWeekwiseStatus = (habit: HabitUI) => {
  const fullWeekFilledStatusTracker = getFullWeekStatusFilled(habit);
  const weeklyTracker: DailyStatus[][] = [];

  for (let i = 0; i < fullWeekFilledStatusTracker.tracker.length; i++) {
    const index = Math.floor(i / 7);
    if (!weeklyTracker[index]) weeklyTracker[index] = [];
    weeklyTracker[index][i % 7] = fullWeekFilledStatusTracker.tracker[i];
  }
  weeklyTracker.reverse();

  return weeklyTracker;
};

export const getDayLabel = (date: Date) => {
  const today = new Date();
  const daysGap = getDaysGap(today, date);

  if (daysGap < -2) return `${-daysGap} days back`;
  if (daysGap === -2) return "Day before yesterday";
  if (daysGap === -1) return "Yesterday";
  if (daysGap === 0) return "Today";
  if (daysGap === 1) return "Tomorrow";
  if (daysGap === 2) return `Day after tomorrow`;

  return `${daysGap} days after`;
};

export const getHabitInfoLabel = (habitId: number) => {
  const today = new Date();
  const habitStartDate = new Date(habitId);
  const daysBefore = -getDateGapFromToday(habitStartDate);

  if (daysBefore === 0) return `Just created this habit today`;
  if (daysBefore === 1) return `This habit started from yesterday`;
  if (daysBefore > 1 && daysBefore < 5)
    return `Started following this ${daysBefore} back`;

  const { aceStreak, followStreak, missed } = getCompletion(
    fetchHabit(habitId),
    getGapDate(today, -daysBefore),
    today
  );

  if (aceStreak >= 12)
    return `Nailed ${aceStreak} days in a row. Woah! Don't stop.`;
  if (aceStreak >= 4)
    return `Doing good for ${aceStreak} days straight! Keep it up.`;
  if (followStreak >= 15)
    return `Didn't miss for ${followStreak} days in a row. Kudos!`;
  if (followStreak >= 4)
    return `${followStreak} days in a row. Nice! keep going.`;
  if (missed) `Missed ${missed} days. Impossible is I M Possible.`;

  return "Just stick to it. Patience is the key.";
};

export const getUpdatedTrackerDataForModifiedLevels = (
  oldLevels: LevelUI[],
  newLevels: LevelUI[],
  tracker: DailyStatus[]
) => {
  if (!oldLevels.length || oldLevels.length === newLevels.length)
    return tracker;
  const updatedTracker = [...tracker];
  const updates: { indices: number[]; newLevel: LevelUI }[] = [];
  oldLevels.forEach((oldLevel, oldLevelIndex) => {
    const newLevel = newLevels.find((l) => l.name === oldLevel.name);
    const oldLevelRemoved = !newLevel;
    const registerUpdates = (changedLevel: LevelUI) => {
      const indices: number[] = [];
      tracker.forEach((status, i) => {
        if (status.level.code === oldLevel.code) indices.push(i);
      });
      updates.push({
        indices: indices,
        newLevel: changedLevel,
      });
    };
    // the status for the day in old tracker should remain the same
    if (oldLevelRemoved) {
      // if last level is removed, the old highest statu codes should decrease by 1
      if (oldLevelIndex === oldLevels.length - 1)
        registerUpdates(newLevels[newLevels.length - 1]);
      return;
    }
    const levelPositionChanged = newLevel.code !== oldLevel.code;
    if (!levelPositionChanged) return;
    registerUpdates(newLevel);
  });

  updates.forEach((update) => {
    update.indices.forEach((index) => {
      updatedTracker[index] = {
        ...updatedTracker[index],
        level: update.newLevel,
      };
    });
  });

  return updatedTracker;
};

export const getSanitizedLevelsAfterAddOrRemove = (
  modifiedLevels: LevelUI[]
) => {
  const newMaxIndex = modifiedLevels.length - 1;
  for (let i = 0; i < modifiedLevels.length; i++) {
    modifiedLevels[i] = {
      ...modifiedLevels[i],
      code: i,
      isMaxLevel: i === newMaxIndex,
    };
  }
  return modifiedLevels;
};

export const isLastInteractionLongBack = () => {
  const now = new Date().getTime();
  const lastIntrxn = getLastInteraction();
  return now - lastIntrxn > getMinutesInMS(1);
};

export const getHabitsStatusForTheDay = (habits: HabitUI[], date: Date) => {
  const statuses = habits.map(
    (hab) => getDayStatus(hab.tracker, date) as DailyStatus
  );
  return {
    done: statuses.reduce((sum, st) => sum + (st.level.isMaxLevel ? 1 : 0), 0),
    started: statuses.reduce(
      (sum, st) => sum + (st.level.code > 0 && !st.level.isMaxLevel ? 1 : 0),
      0
    ),
    notDone: statuses.reduce(
      (sum, st) => sum + (st.level.code === 0 ? 1 : 0),
      0
    ),
    total: habits.reduce((sum, hab) => sum + hab.levels.length - 1, 0),
  };
};

export const getHabitsStatusLabelForTheDay = (
  habits: HabitUI[],
  date: Date
) => {
  const status = getHabitsStatusForTheDay(habits, date);

  if (status.done === 0 && status.started === 0 && status.notDone === 0)
    return ``;
  if (status.done === 0 && status.started === 0 && status.notDone > 0)
    return `Update below ${status.notDone} tsaks for the day.`;
  if (status.done > 0 && status.started === 0 && status.notDone === 0)
    return `Great! All tasks updated.`;

  return `
    ${status.done ? `${status.done} done.` : ``}
    ${status.started ? ` ${status.started} started.` : ``}
    ${status.notDone ? ` ${status.notDone} yet to start.` : ``}
  `;
};

export const getSortedHabits = (
  habits: HabitUI[],
  sortOptionIndex: number,
  totalMonths: number
): HabitUI[] => {
  const selectedOption = HOMEPAGE_SORT_OPTIONS[sortOptionIndex];
  const { startDate, endDate } = getDateWindow(totalMonths);
  const optionLabel = selectedOption.label;
  const sortedHabitsWithCompletion = habits.map((habit) => ({
    ...habit,
    completion: getCompletion(habit, startDate, endDate).percent,
  }));
  sortedHabitsWithCompletion.sort((a, b) => {
    if (optionLabel === "Completion (Highest first)")
      return b.completion - a.completion;
    if (optionLabel === "Completion (Lowest first)")
      return a.completion - b.completion;
    if (optionLabel === "Date created (Oldest first)") return a.id - b.id;

    return b.id - a.id;
  });

  return sortedHabitsWithCompletion;
};

export const getLevelsCompletionList = (habit: HabitUI): LevelCompletion[] => {
  const initialLevelsCompletion = habit.levels.map((_) => 0);

  const levelsCompletionCount = habit.tracker.reduce((arr, status) => {
    if (status.level.code > -1)
      arr[status.level.code] = arr[status.level.code]
        ? arr[status.level.code] + 1
        : 1;
    return arr;
  }, initialLevelsCompletion);
  const completionTotal = levelsCompletionCount.reduce((a, b) => a + b);
  const list = levelsCompletionCount.map((count, i) => ({
    level: habit.levels[i],
    count,
    weightage: count * (i / (habit.levels.length - 1)),
    percent: Math.round((100 * count) / completionTotal),
  }));
  list.reverse();

  return list;
};

export const getAllLevelsCompletionLabel = (
  levelsCompletion: LevelCompletion[]
) => {
  return `${levelsCompletion
    .reduce((sum, levelData) => sum + levelData.weightage, 0)
    .toFixed(1)} / ${levelsCompletion.reduce(
    (sum, levelData) => sum + levelData.count,
    0
  )}`;
};

export const getNavbarLinks = (urlPath: string): NavbarLink[] => [
  {
    label: "Today",
    icon: "calendar_month",
    isSelected: urlPath === "/",
    href: "/",
  },
  {
    label: "Habits",
    icon: "checklist",
    isSelected: urlPath === "/habits/",
    href: "/habits/",
  },
  {
    label: "Settings",
    icon: "settings",
    isSelected: urlPath === "/settings/",
    href: "/settings/",
  },
];
