import { compute, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import {
  getMonthName,
  getWeekdayName,
  getWeekwiseStatus,
} from "../../../@common/transforms";
import { DailyStatus, HabitUI } from "../../../@common/types";
import { ColorDot } from "../../../@components";

type CalendarProps = {
  cssClasses?: string;
  habit: HabitUI;
  onDateClick: (dayStatus: DailyStatus) => void;
};

export const Calendar = component<CalendarProps>(
  ({ cssClasses, habit, onDateClick }) => {
    const weekwiseTracker = compute(getWeekwiseStatus, habit);
    const { colorIndex, levels } = trap(habit).props;

    return m.Div({
      class: cssClasses,
      children: [
        m.Div({
          class: "mb2 flex items-center justify-between",
          children: m.For({
            subject: Array(7).fill(0),
            map: (_, dayIndex) =>
              m.Div({
                class: `h2 w2 br-100 gray f7 flex items-center justify-center`,
                children: getWeekdayName(dayIndex, 1),
              }),
          }),
        }),
        m.Div({
          children: m.For({
            subject: weekwiseTracker,
            map: (week) =>
              m.Div({
                class: "flex items-center h-60",
                children: [
                  m.Div({
                    class: `w-100 mb3 flex items-center justify-between`,
                    children: m.For({
                      subject: week,
                      map: (day) => {
                        const dateNum = day.date.getDate();
                        const monthIndex = day.date.getMonth();
                        const monthName = getMonthName(monthIndex, 3);
                        const dateText = `${
                          dateNum === 1
                            ? monthIndex === 0
                              ? day.date.getFullYear().toString()
                              : monthName
                            : dateNum
                        }`;

                        return ColorDot({
                          cssClasses:
                            "h2 w2 flex items-center justify-center f7",
                          colorIndex: colorIndex,
                          level: day.level.code,
                          totalLevels: levels.value.length || 2,
                          textContent: dateText,
                          showText: day.level !== undefined,
                          onClick: () => onDateClick(day),
                        });
                      },
                    }),
                  }),
                ],
              }),
          }),
        }),
      ],
    });
  }
);
