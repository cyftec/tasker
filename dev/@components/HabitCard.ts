import { compute, dispose, tmpl, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import {
  getAchievedMilestone,
  getCompletion,
  getDateWindow,
  getMonthFirstDates,
} from "../@common/transforms";
import { HabitUI } from "../@common/types";
import { handleTap } from "../@common/utils";
import { Icon } from "../@elements";
import { MonthMap } from "./MonthMap";

type HabitCardProps = {
  cssClasses?: string;
  habit: HabitUI;
  months: number;
  onClick: () => void;
};

export const HabitCard = component<HabitCardProps>(
  ({ cssClasses, habit, months, onClick }) => {
    const { milestones, title, colorIndex, levels } = trap(habit).props;
    const completion = compute(
      (months: number, habit: HabitUI) => {
        const { startDate, endDate } = getDateWindow(months);
        return getCompletion(habit, startDate, endDate).percent;
      },
      months,
      habit
    );
    const achievedMilestone = compute(
      getAchievedMilestone,
      milestones,
      completion
    );
    const { icon, color } = trap(achievedMilestone).props;
    const monthFirstDates = compute(
      (ms) =>
        getMonthFirstDates(ms).map((monthFirstDate) => ({
          monthFirstDate,
          index: monthFirstDate.getTime(),
        })),
      months
    );
    const classes = tmpl`pointer bg-white ${cssClasses}`;
    const completionIconCss = tmpl`mr1 ${color}`;
    const completionLabel = tmpl`${completion}%`;

    const onUnmount = () => {
      dispose(
        milestones,
        title,
        colorIndex,
        levels,
        completion,
        achievedMilestone,
        icon,
        color,
        monthFirstDates,
        classes,
        completionIconCss,
        completionLabel
      );
    };

    return m.Div({
      onunmount: onUnmount,
      class: classes,
      onclick: handleTap(onClick),
      children: [
        m.Div({
          class: "flex items-center justify-between nt1 mb2",
          children: [
            m.Div({
              class: "f5 dark-gray b",
              children: title,
            }),
            m.Div({
              class: "f6 silver b flex items-center",
              children: [
                Icon({
                  cssClasses: completionIconCss,
                  iconName: icon,
                }),
                completionLabel,
              ],
            }),
          ],
        }),
        m.Div({
          class: "mt2 mb1",
          children: m.For({
            subject: monthFirstDates,
            itemKey: "index",
            map: (monthsData) => {
              return MonthMap({
                cssClasses: "mb1",
                habit: habit,
                date: trap(monthsData).prop("monthFirstDate"),
                colorIndex: colorIndex,
                totalLevels: levels.value.length,
              });
            },
          }),
        }),
      ],
    });
  }
);
