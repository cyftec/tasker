import { compute, derive, dispose, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { getDayStatus } from "../../@common/transforms";
import { HabitUI } from "../../@common/types";
import { handleTap } from "../../@common/utils";
import { Modal } from "../../@elements";
import { ColorDot } from "../ColorDot";

type HabitStatusEditModalProps = {
  isOpen: boolean;
  habit: HabitUI;
  date: Date;
  showTitleInHeader?: boolean;
  onClose?: () => void;
  onChange: (levelCode: number) => void;
};

export const HabitStatusEditModal = component<HabitStatusEditModalProps>(
  ({ isOpen, habit, date, showTitleInHeader, onClose, onChange }) => {
    const { title, levels, tracker, colorIndex } = trap(habit).props;
    const headerLabel = derive(() =>
      showTitleInHeader?.value
        ? `Change status of  '${title.value}'`
        : `Change status for ${date.value.toDateString()}`
    );
    const dayStatus = compute(getDayStatus, tracker, date);
    const totalLevels = trap(levels).length;
    const levelTiles = derive(() => {
      const reversedLevels = [...levels.value];
      reversedLevels.reverse();

      return reversedLevels.map((level, levelIndex) => {
        const levelCode = totalLevels.value - 1 - levelIndex;
        const tileColorCss =
          dayStatus.value?.level.code === levelCode
            ? "bg-near-white black fw6"
            : "gray fw5";
        const levelTileCSS = `pointer flex items-center pv3 pa3 bt b--moon-gray ${tileColorCss}`;
        const borderCss = levelCode < 1 ? "b--light-silver" : "b--transparent";
        const dotClasses = `pa1 mr3 ba b ${borderCss}`;
        const levelName = level.name;

        return { levelName, levelCode, levelTileCSS, dotClasses };
      });
    });

    const onModalUnmount = () =>
      dispose(
        title,
        levels,
        tracker,
        colorIndex,
        headerLabel,
        dayStatus,
        totalLevels,
        levelTiles
      );

    return Modal({
      onUnmount: onModalUnmount,
      cssClasses: "f5 normal ba bw0 outline-0",
      isOpen: isOpen,
      onTapOutside: onClose,
      content: m.Div({
        class: "mnw5",
        children: [
          m.Div({
            class: "f5 b tc pa3",
            children: headerLabel,
          }),
          m.Div({
            class: "f5 mb1",
            children: m.For({
              subject: levelTiles,
              map: (levelTile) => {
                const { levelName, levelCode, levelTileCSS, dotClasses } =
                  trap(levelTile).props;

                return m.Div({
                  onunmount: () =>
                    dispose(levelName, levelCode, levelTileCSS, dotClasses),
                  class: levelTileCSS,
                  onclick: handleTap(() => onChange(levelCode.value)),
                  children: [
                    ColorDot({
                      cssClasses: dotClasses,
                      colorIndex: colorIndex,
                      level: levelCode,
                      totalLevels: levels.value.length,
                      isRectangular: true,
                    }),
                    m.Span(levelName),
                  ],
                });
              },
            }),
          }),
        ],
      }),
    });
  }
);
