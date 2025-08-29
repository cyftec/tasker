import { compute, op, signal, trap } from "@cyftech/signal";
import { m } from "@mufw/maya";
import {
  intializeTrackerEmptyDays,
  updateInteractionTime,
} from "./@common/localstorage";
import { checkNoHabitsInStore } from "./@common/localstorage/habits";
import {
  getDayLabel,
  getGapDate,
  getHabitsForDate,
  getHabitsStatusLabelForTheDay,
  getLastNDays,
  getNewHabit,
  isLastInteractionLongBack,
  updateHabitStatus,
} from "./@common/transforms";
import { HabitUI } from "./@common/types";
import { goToNewHabitsPage } from "./@common/utils";
import {
  AddHabitButton,
  DayHabitTile,
  EmptyHomePageIllustration,
  HabitStatusEditModal,
  HTMLPage,
  NavScaffold,
  SplashScreen,
  WeekDateSelector,
} from "./@components";
import { Link } from "./@elements";

const now = new Date();
const noHabitsInStore = signal(false);
const progress = signal(0);
const itsTimeToRefresh = signal(false);
const showSplashScreen = op(itsTimeToRefresh).andThisIsLT(progress, 100).truthy;
const selectedDate = signal(now);
const sevenDays = getLastNDays(getGapDate(now, 2), 7);
const habits = compute(getHabitsForDate, selectedDate);
const readableDateLabel = compute(getDayLabel, selectedDate);
const habitsStatusLabel = compute(
  getHabitsStatusLabelForTheDay,
  habits,
  selectedDate
);
const createNewHabitBtnLabel = compute(
  (habits: HabitUI[]) =>
    habits.length === 0
      ? "No habit for the day! Add one."
      : habits.length < 5
      ? `Only ${habits.length} habits a day! Add more.`
      : ``,
  habits
);
const isStatusEditorOpen = signal(false);
const statusEditableHabitIndex = signal(0);
const nullishEditableHabit = trap(habits).at(statusEditableHabitIndex);
const editableHabit = trap(nullishEditableHabit).or(getNewHabit());

const openHabitEditor = (habitIndex: number) => {
  isStatusEditorOpen.value = true;
  statusEditableHabitIndex.value = habitIndex;
};
const closeHabitEditor = () => {
  isStatusEditorOpen.value = false;
  statusEditableHabitIndex.value = 0;
};
const onHabitStatusChange = (levelCode: number) => {
  updateHabitStatus(editableHabit.value, levelCode, selectedDate.value);
  isStatusEditorOpen.value = false;
  // force update date to refetch latest habits for the day
  selectedDate.value = new Date(selectedDate.value.getTime() + 1);
};

const transitionToHabitsPage = () => {
  itsTimeToRefresh.value = isLastInteractionLongBack();
  const tickerID = setInterval(() => {
    progress.value += 1;
    if (progress.value >= 100) {
      clearInterval(tickerID);
      itsTimeToRefresh.value = false;
      updateInteractionTime(new Date());
    }
  }, 30);
};

const triggerPageDataRefresh = () => {
  intializeTrackerEmptyDays();
  selectedDate.value = new Date();
  noHabitsInStore.value = checkNoHabitsInStore();
};

const onPageMount = () => {
  transitionToHabitsPage();
  intializeTrackerEmptyDays();
  triggerPageDataRefresh();
  window.addEventListener("pageshow", triggerPageDataRefresh);
};

export default HTMLPage({
  cssClasses: "bg-white",
  onMount: onPageMount,
  body: m.Div({
    children: [
      HabitStatusEditModal({
        isOpen: isStatusEditorOpen,
        showTitleInHeader: true,
        habit: editableHabit,
        date: selectedDate,
        onClose: closeHabitEditor,
        onChange: onHabitStatusChange,
      }),
      m.If({
        subject: showSplashScreen,
        isTruthy: () => SplashScreen({ progress }),
        isFalsy: () =>
          NavScaffold({
            cssClasses: "ph3 bg-white",
            route: "/",
            header: "Tasks in a day",
            content: m.Div(
              m.If({
                subject: noHabitsInStore,
                isTruthy: () => EmptyHomePageIllustration({}),
                isFalsy: () =>
                  m.Div({
                    children: [
                      m.Div({
                        onmount: (el) => (el.scrollLeft = el.scrollWidth),
                        class: `sticky top-3 bg-white pb2 flex items-center justify-between z-999 w-100`,
                        children: m.For({
                          subject: sevenDays,
                          map: (date) =>
                            WeekDateSelector({
                              date: date,
                              selectedDate: selectedDate,
                              onChange: (date) => (selectedDate.value = date),
                            }),
                        }),
                      }),
                      m.Div({
                        class: "mt2 mb2 f4 b",
                        children: readableDateLabel,
                      }),
                      m.Div({
                        class: "mb4 pb2 silver",
                        children: habitsStatusLabel,
                      }),
                      m.Div({
                        class: "mt4",
                        children: m.For({
                          subject: habits,
                          itemKey: "id",
                          n: Infinity,
                          nthChild: Link({
                            cssClasses: "flex pl5 pr3 nl3 mt4",
                            onClick: goToNewHabitsPage,
                            children: createNewHabitBtnLabel,
                          }),
                          map: (habit, habitIndex) =>
                            DayHabitTile({
                              habit: habit,
                              day: selectedDate,
                              onColorDotClick: () =>
                                openHabitEditor(habitIndex.value),
                            }),
                        }),
                      }),
                      m.Div({ class: "pv6" }),
                    ],
                  }),
              })
            ),
            navbarTop: m.Div(
              m.If({
                subject: noHabitsInStore,
                isFalsy: () => AddHabitButton({}),
              })
            ),
          }),
      }),
    ],
  }),
});
