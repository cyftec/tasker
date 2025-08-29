import { compute, derive, op, signal, tmpl, trap } from "@cyftech/signal";
import { m } from "@mufw/maya";
import { intializeTrackerEmptyDays } from "../../@common/localstorage";
import {
  getAchievedMilestone,
  getAllLevelsCompletionLabel,
  getCompletion,
  getHabitFromUrl,
  getLevelsCompletionList,
  getNewHabit,
  getWeekwiseStatus,
  updateHabitStatus,
} from "../../@common/transforms";
import { HabitUI } from "../../@common/types";
import { goToHabitEditPage } from "../../@common/utils";
import {
  ColorDot,
  GoalStatus,
  GoBackButton,
  HabitDeleteModal,
  HabitStatusEditModal,
  HTMLPage,
  Section,
} from "../../@components";
import { Button, Icon, Scaffold } from "../../@elements";
import { Calendar } from "./@components";

const error = signal("");
const habit = signal<HabitUI>(getNewHabit());
const {
  id: habitId,
  title: pageTitle,
  colorIndex: habitColorIndex,
  levels: habitLevels,
  milestones: habitMilestones,
  isStopped: habitIsStopped,
} = trap(habit).props;
const showGoalStatus = signal(false);
const deleteActionModalOpen = signal(false);
const updateLevelModalOpen = signal(false);
const updateLevelModalData = signal({
  date: new Date(),
  selectedLevelIndex: 0,
});
const levelsCompletionList = compute(getLevelsCompletionList, habit);
const allLevelsCompletionLabel = compute(
  getAllLevelsCompletionLabel,
  levelsCompletionList
);
const completion = derive(
  () => getCompletion(habit.value, new Date(habitId.value), new Date()).percent
);
const milestoneAchieved = compute(
  getAchievedMilestone,
  habitMilestones,
  completion
);
const {
  icon: achievedMilestoneIcon,
  label: achievedMilestoneLabel,
  color: achievedMilestoneColor,
} = trap(milestoneAchieved).props;
const weekwiseTracker = compute(getWeekwiseStatus, habit);

const triggerPageDataRefresh = () => {
  const fetchedHabit = getHabitFromUrl();
  if (!fetchedHabit) {
    error.value = "Incorrect habit ID provided in the query params.";
    return;
  }
  habit.value = fetchedHabit;
};

const openDeleteModal = () => (deleteActionModalOpen.value = true);
const closeDeleteModal = () => (deleteActionModalOpen.value = false);
const onHabitDelete = () => {
  closeDeleteModal();
  history.back();
};

const updateLevel = (levelCode: number) => {
  if (!habit.value) return;
  updateHabitStatus(habit.value, levelCode, updateLevelModalData.value.date);
  updateLevelModalOpen.value = false;
  triggerPageDataRefresh();
};

const onPageMount = () => {
  intializeTrackerEmptyDays();
  triggerPageDataRefresh();
  window.addEventListener("pageshow", triggerPageDataRefresh);
};

export default HTMLPage({
  onMount: onPageMount,
  body: Scaffold({
    cssClasses: "bg-white ph3",
    header: m.Div({
      class: "flex items-start justify-between",
      children: [
        m.Div({
          class: op(pageTitle).lengthGT(22).ternary("f2dot66", ""),
          children: pageTitle,
        }),
        m.If({
          subject: habitIsStopped,
          isFalsy: () =>
            Icon({
              cssClasses: "mt1 mr1 ba b--silver bw1 br-100 pa1 noselect",
              size: 18,
              iconName: "edit",
              onClick: () => goToHabitEditPage(habitId.value),
            }),
        }),
      ],
    }),
    content: m.Div({
      children: [
        HabitDeleteModal({
          isOpen: deleteActionModalOpen,
          habit: habit,
          onClose: closeDeleteModal,
          onDone: onHabitDelete,
        }),
        HabitStatusEditModal({
          isOpen: updateLevelModalOpen,
          habit: habit,
          date: trap(updateLevelModalData).prop("date"),
          onClose: () => (updateLevelModalOpen.value = false),
          onChange: updateLevel,
        }),
        m.If({
          subject: error,
          isTruthy: () => m.Div({ class: "red", children: error }),
          isFalsy: () =>
            m.Div(
              m.If({
                subject: habit,
                isFalsy: () => m.Div({ class: "", children: "habit.." }),
                isTruthy: () =>
                  m.Div({
                    children: [
                      m.If({
                        subject: habitIsStopped,
                        isTruthy: () =>
                          m.Div([
                            m.Div({
                              class: "red mb3",
                              children: "Status: STOPPED PERMANENTLY",
                            }),
                            Button({
                              cssClasses: "pv2 ph3 nt2 mb4 red",
                              onTap: openDeleteModal,
                              children: "Delete Permanently",
                            }),
                          ]),
                      }),
                      Section({
                        cssClasses: "pb3",
                        title: tmpl`Completion status ${() =>
                          showGoalStatus.value
                            ? ""
                            : `(target ${habitMilestones.value[0].percent}%)`}`,
                        children: [
                          m.Div({
                            class: "mt3",
                            children: m.For({
                              subject: levelsCompletionList,
                              n: Infinity,
                              nthChild: m.Div({
                                class: `flex items-center justify-between mt2 pt1 bt bw1 b--near-white b mid-gray`,
                                children: [
                                  m.Div({
                                    class: "flex items-center",
                                    children: [
                                      Icon({
                                        cssClasses: tmpl`mr1 ${achievedMilestoneColor}`,
                                        size: 12,
                                        iconName: achievedMilestoneIcon,
                                      }),
                                      achievedMilestoneLabel,
                                    ],
                                  }),
                                  m.Div({
                                    class: "flex items-center",
                                    children: [
                                      allLevelsCompletionLabel,
                                      m.Span({ class: "ml1" }),
                                      m.Div(tmpl` (${completion}%)`),
                                    ],
                                  }),
                                ],
                              }),
                              map: (acheievemnt) =>
                                m.Div({
                                  class:
                                    "flex items-center justify-between mb2",
                                  children: [
                                    m.Div({
                                      class: "flex items-center",
                                      children: [
                                        ColorDot({
                                          cssClasses: `pa1 mr2`,
                                          colorIndex: habitColorIndex,
                                          level: acheievemnt.level.code,
                                          totalLevels: habitLevels.value.length,
                                          isRectangular: true,
                                        }),
                                        m.Div(acheievemnt.level.name),
                                      ],
                                    }),
                                    m.Div(
                                      `${acheievemnt.count} times (${acheievemnt.percent}%)`
                                    ),
                                  ],
                                }),
                            }),
                          }),
                          m.If({
                            subject: showGoalStatus,
                            isTruthy: () =>
                              GoalStatus({
                                cssClasses: "pt4 mt3 mb3",
                                milestones: habitMilestones,
                                achievedMilestone: milestoneAchieved,
                                completionPercent: completion,
                              }),
                          }),
                          Button({
                            cssClasses: "pa2 ph3 mt4 mb2",
                            children: tmpl`${op(showGoalStatus).ternary(
                              "Hide",
                              "Show"
                            )} target goal status`,
                            onTap: () =>
                              (showGoalStatus.value = !showGoalStatus.value),
                          }),
                        ],
                      }),
                      Section({
                        title: "Tracker",
                        children: Calendar({
                          habit: habit,
                          onDateClick: (dayStatus) => {
                            if (habitIsStopped.value) return;
                            updateLevelModalOpen.value = true;
                            updateLevelModalData.value = {
                              date: dayStatus.date,
                              selectedLevelIndex: dayStatus.level.code,
                            };
                          },
                        }),
                      }),
                    ],
                  }),
              })
            ),
        }),
      ],
    }),
    bottombar: m.Div({
      class: "pb3",
      children: GoBackButton({}),
    }),
  }),
});
