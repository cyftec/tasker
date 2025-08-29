import { derive, dispose, tmpl, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import {
  getHabitStatusBetweenDates,
  getMonthName,
} from "../@common/transforms";
import { HabitUI } from "../@common/types";
import { ColorDot } from "./ColorDot";

type MonthMapProps = {
  cssClasses?: string;
  habit: HabitUI;
  date: Date;
  colorIndex: number;
  totalLevels: number;
};

export const MonthMap = component<MonthMapProps>(
  ({ cssClasses, habit, date, colorIndex, totalLevels }) => {
    const statusList = derive(() => {
      const dateYear = date.value.getFullYear();
      const dateMonth = date.value.getMonth();
      const firstDay = new Date(dateYear, dateMonth, 1);
      const lastDay = new Date(dateYear, dateMonth + 1, 0);
      return getHabitStatusBetweenDates(
        habit.value.tracker,
        firstDay,
        lastDay
      ).map((s) => ({ ...s, level: s.level.code }));
    });
    const classes = tmpl`flex items-center ${cssClasses}`;
    const monthLabel = derive(() => getMonthName(date.value.getMonth(), 3));

    const onUnmount = () => dispose(statusList, classes, monthLabel);

    return m.Div({
      onunmount: onUnmount,
      class: classes,
      children: [
        m.Div({
          class: "f8 b w2 light-silver",
          children: monthLabel,
        }),
        m.Div({
          class: "w-100 flex items-center justify-between",
          children: m.For({
            subject: statusList,
            itemKey: "key",
            map: (status) => {
              const levelCode = trap(status).prop("level");
              return ColorDot({
                cssClasses: "pa1",
                colorIndex: colorIndex,
                level: levelCode,
                totalLevels: totalLevels,
              });
            },
          }),
        }),
      ],
    });
  }
);
