import { derive, dispose, op, tmpl, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { getDayStatus, getHabitInfoLabel } from "../@common/transforms";
import { DailyStatus, HabitUI } from "../@common/types";
import { goToHabitPage, handleTap } from "../@common/utils";
import { ColorDot } from "./ColorDot";

type DayHabitTileProps = {
  habit: HabitUI;
  day: Date;
  onColorDotClick: () => void;
};

export const DayHabitTile = component<DayHabitTileProps>(
  ({ habit, day, onColorDotClick }) => {
    const { id, title, colorIndex, levels, tracker } = trap(habit).props;
    const totalLevels = trap(levels).length;
    const statusLevelCode = derive(() => {
      const status = getDayStatus(tracker.value, day.value) as DailyStatus;
      return status.level.code;
    });
    const isLevelGreaterThanZero = op(statusLevelCode).isGT(0).truthy;
    const borderCss = op(statusLevelCode)
      .isLT(1)
      .ternary("b--light-silver", "b--transparent");
    const colorDotClasses = tmpl`pa3 mr3 ba b ${borderCss}`;

    const onUnmount = () =>
      dispose(
        id,
        title,
        colorIndex,
        levels,
        tracker,
        totalLevels,
        statusLevelCode,
        isLevelGreaterThanZero,
        borderCss
      );

    return m.Div({
      onunmount: onUnmount,
      class: "mt4 flex items-center",
      children: [
        ColorDot({
          cssClasses: colorDotClasses,
          colorIndex: colorIndex,
          level: statusLevelCode,
          totalLevels: totalLevels,
          icon: "check",
          iconSize: 22,
          showText: isLevelGreaterThanZero,
          showHeight: true,
          onClick: onColorDotClick,
        }),
        m.Div({
          class: "pointer",
          onclick: handleTap(() => goToHabitPage(id.value)),
          children: [
            m.Div({
              class: "f5 fw6 f4-ns fw4-ns",
              children: title,
            }),
            m.Div({
              class: "f6 light-silver pt05",
              children: getHabitInfoLabel(id.value),
            }),
          ],
        }),
      ],
    });
  }
);
