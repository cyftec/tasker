import { compute, derive, dispose, signal, trap } from "@cyftech/signal";
import { m } from "@mufw/maya";
import { HOMEPAGE_OVERVIEW_TABS, INITIAL_SETTINGS } from "../@common/constants";
import {
  fetchHabits,
  getHabitsPageSettings,
  intializeTrackerEmptyDays,
  updateHabitsPageSettings,
} from "../@common/localstorage";
import { checkNoHabitsInStore } from "../@common/localstorage/habits";
import { getSortedHabits } from "../@common/transforms";
import { HabitUI } from "../@common/types";
import { goToHabitPage } from "../@common/utils";
import {
  AddHabitButton,
  HabitCard,
  HTMLPage,
  NavScaffold,
  SortOptions,
} from "../@components";
import { TabBar } from "../@elements";

const noHabitsInStore = signal(false);
const pageSettings = signal(INITIAL_SETTINGS.habitsPage);
const { tabIndex, sortOptionIndex } = trap(pageSettings).props;
const tabs = derive(() =>
  HOMEPAGE_OVERVIEW_TABS.map((ov, index) => ({
    label: ov.label,
    isSelected: index === tabIndex.value,
  }))
);
const totalOverviewMonths = compute(
  (i: number) => HOMEPAGE_OVERVIEW_TABS[i].months,
  tabIndex
);
const habits = signal<HabitUI[]>([]);
const sortedHabits = compute(
  getSortedHabits,
  habits,
  sortOptionIndex,
  totalOverviewMonths
);
const [sortedStoppedHabits, sortedActiveHabits] = trap(sortedHabits).partition(
  (hab) => hab.isStopped
);

const onSortOptionChange = (optionIndex) => {
  updateHabitsPageSettings({
    ...pageSettings.value,
    sortOptionIndex: optionIndex,
  });
  pageSettings.value = getHabitsPageSettings();
};

const onTabChange = (tabIndex: number) => {
  updateHabitsPageSettings({ ...pageSettings.value, tabIndex });
  pageSettings.value = getHabitsPageSettings();
};

const triggerPageDataRefresh = () => {
  habits.value = fetchHabits();
  pageSettings.value = getHabitsPageSettings();
  noHabitsInStore.value = checkNoHabitsInStore();
};

const onPageMount = () => {
  intializeTrackerEmptyDays();
  triggerPageDataRefresh();
  window.addEventListener("pageshow", triggerPageDataRefresh);
};

const onPageUnmount = () => {
  dispose(
    tabIndex,
    sortOptionIndex,
    totalOverviewMonths,
    sortedHabits,
    sortedStoppedHabits,
    sortedActiveHabits
  );
};

export default HTMLPage({
  cssClasses: "bg-white",
  onMount: onPageMount,
  onUnMount: onPageUnmount,
  body: NavScaffold({
    cssClasses: "ph3 bg-white",
    route: "/habits/",
    header: m.Div({
      class: "flex items-start justify-between bg-white",
      children: [
        "All habits",
        SortOptions({
          cssClasses: "mt2 mr2",
          iconSize: 22,
          selectedOptionIndex: sortOptionIndex,
          onChange: onSortOptionChange,
        }),
      ],
    }),
    content: m.Div(
      m.If({
        subject: noHabitsInStore,
        isTruthy: () =>
          m.Div({
            class: "flex flex-column items-center justify-around",
            children: [
              m.Img({
                class: "mt3 pt4",
                src: "/assets/images/empty.png",
                height: "200",
              }),
              m.Div("It's all empty here!"),
              AddHabitButton({
                cssClasses: "pt5",
                justifyCssClasses: "justify-around",
                label: "Add your first habit",
              }),
            ],
          }),
        isFalsy: () =>
          m.Div([
            TabBar({
              cssClasses: "nl1 f6",
              tabs: tabs,
              onTabChange: onTabChange,
            }),
            m.Div(
              m.For({
                subject: sortedActiveHabits,
                itemKey: "id",
                n: 0,
                nthChild: m.Div({
                  class: "silver f6 mt3 pt1 mb4",
                  children: [
                    "ACTIVE HABITS",
                    m.If({
                      subject: trap(sortedActiveHabits).length,
                      isFalsy: () =>
                        m.Div({
                          class: "mt3",
                          children: "None",
                        }),
                    }),
                  ],
                }),
                map: (activeHabit) =>
                  HabitCard({
                    cssClasses: "mb4",
                    habit: activeHabit,
                    months: totalOverviewMonths,
                    onClick: () => goToHabitPage(activeHabit.value.id),
                  }),
              })
            ),
            m.Div(
              m.For({
                subject: sortedStoppedHabits,
                itemKey: "id",
                n: 0,
                nthChild: m.Div({
                  class: "silver f6 mt5 mb2",
                  children: [
                    "STOPPED HABITS",
                    m.If({
                      subject: trap(sortedStoppedHabits).length,
                      isFalsy: () =>
                        m.Div({
                          class: "mt3",
                          children: "None",
                        }),
                    }),
                  ],
                }),
                map: (stoppedHabit) =>
                  HabitCard({
                    cssClasses: "mb4",
                    habit: stoppedHabit,
                    months: totalOverviewMonths,
                    onClick: () => goToHabitPage(stoppedHabit.value.id),
                  }),
              })
            ),
          ]),
      })
    ),
    navbarTop: m.Div(
      m.If({
        subject: noHabitsInStore,
        isFalsy: () => AddHabitButton({}),
      })
    ),
  }),
});
