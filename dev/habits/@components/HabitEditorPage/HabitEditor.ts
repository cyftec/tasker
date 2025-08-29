import { derive, tmpl, signal, Signal, trap, op } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { ColorDot, Section } from "../../../@components";
import { BASE_COLORS, BASE_LEVELS } from "../../../@common/constants";
import {
  getAchievedMilestone,
  getAddRemoveButtonsVisibility,
  getSanitizedLevelsAfterAddOrRemove,
  getWeekdayName,
  levelTextboxDisability,
} from "../../../@common/transforms";
import {
  HabitUI,
  MilestonesUI,
  WeekdayFrequency,
} from "../../../@common/types";
import { handleTap } from "../../../@common/utils";
import {
  AddRemoveButton,
  Button,
  Icon,
  NumberBox,
  TextBox,
} from "../../../@elements";

type HabitEditorProps = {
  cssClasses?: string;
  editableHabit?: HabitUI;
  editedHabit: Signal<HabitUI>;
  hideDescriptions?: boolean;
  showFullCustomisations?: boolean;
  onChange: (updatedHabit: HabitUI) => void;
};

export const HabitEditor = component<HabitEditorProps>(
  ({
    cssClasses,
    editableHabit,
    editedHabit,
    hideDescriptions,
    showFullCustomisations,
    onChange,
  }) => {
    const moreDetails = signal(false);
    const customisationsVisible = trap(showFullCustomisations).or(moreDetails);
    const { title, frequency, levels, milestones, colorIndex } =
      trap(editedHabit).props;
    const everyDay = trap(frequency).every((day) => !!day);
    const selectedCss = "bg-mid-gray white";
    const unSelectedCss = "bg-near-white light-silver";
    const dailyBtnCss = op(everyDay).ternary(selectedCss, unSelectedCss);
    const customisationsButtonIcon = op(moreDetails).ternary("remove", "add");
    const customisationsButtonLabel = tmpl`Show ${op(moreDetails).ternary(
      "Less",
      "More"
    )} Customisations`;

    const updateTitle = (title: string) => {
      onChange({ ...editedHabit.value, title });
    };

    const updateColor = (colorIndex: number) => {
      onChange({ ...editedHabit.value, colorIndex });
    };

    const updateFrequency = (dayIndex: number) => {
      if (dayIndex < -1 || dayIndex > 6) throw `Invalid day index`;

      if (dayIndex === -1) {
        onChange({ ...editedHabit.value, frequency: [1, 1, 1, 1, 1, 1, 1] });
        return;
      }

      const updatedFreq = everyDay.value
        ? (frequency.value.map((_) => 0) as WeekdayFrequency)
        : frequency.value;
      updatedFreq[dayIndex] = everyDay.value
        ? 1
        : updatedFreq[dayIndex]
        ? 0
        : 1;
      onChange({ ...editedHabit.value, frequency: updatedFreq });
    };

    const updateLevel = (levelText: string, levelIndex: number) => {
      const updatedLevels = levels.value;
      updatedLevels[levelIndex] = {
        ...updatedLevels[levelIndex],
        name: levelText,
      };
      onChange({ ...editedHabit.value, levels: updatedLevels });
    };

    const addLevel = (atIndex: number) => {
      const updatedLevels = levels.value;
      updatedLevels.splice(atIndex, 0, {
        isMaxLevel: false,
        name: "",
        code: atIndex,
      });
      onChange({
        ...editedHabit.value,
        levels: getSanitizedLevelsAfterAddOrRemove(updatedLevels),
      });
    };

    const removeLevel = (fromIndex: number) => {
      const updatedLevels = levels.value;
      if (updatedLevels.length < 3) return;
      updatedLevels.splice(fromIndex, 1);
      onChange({
        ...editedHabit.value,
        levels: getSanitizedLevelsAfterAddOrRemove(updatedLevels),
      });
    };

    const updateMilestone = (value: number, index: number) => {
      if (index < 0 || index > 2)
        throw `Incorrect index of milestone passed. Milestone values should not be more than 3.`;
      const updatedMilestones: MilestonesUI = [...editedHabit.value.milestones];
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        percent: value,
      };
      onChange({ ...editedHabit.value, milestones: updatedMilestones });
    };

    return m.Div({
      class: cssClasses,
      children: [
        Section({
          cssClasses: "pb1",
          title: "Weekdays",
          children: m.Div({
            class: "mb3 f6 flex items-center justify-between justify-start-ns",
            children: m.For({
              subject: Array(7).fill(0),
              n: 0,
              nthChild: m.Span({
                class: tmpl`pointer flex items-center justify-center br-pill h2 ph2 mr3-ns ${dailyBtnCss}`,
                children: "Daily",
                onclick: handleTap(() => updateFrequency(-1)),
              }),
              map: (_, dayIndex) => {
                const colorCss = derive(() =>
                  frequency.value[dayIndex] && !everyDay.value
                    ? selectedCss
                    : unSelectedCss
                );

                return m.Span({
                  class: tmpl`pointer flex items-center justify-center br-100 h2 w2 mr3-ns ${colorCss}`,
                  children: getWeekdayName(dayIndex, 1),
                  onclick: handleTap(() => updateFrequency(dayIndex)),
                });
              },
            }),
          }),
        }),
        Section({
          cssClasses: "pb2",
          title: "Title of the habit",
          children: TextBox({
            cssClasses: "ba bw1 b--light-silver br3 pa2 w-100",
            placeholder: `for example, "wake up at 5am"`,
            text: title,
            onchange: updateTitle,
          }),
        }),
        m.If({
          subject: customisationsVisible,
          isTruthy: () =>
            m.Div([
              Section({
                cssClasses: "pb1",
                title: "Select a color tag",
                children: m.Div({
                  class: "mb1 flex items-center",
                  children: m.For({
                    subject: BASE_COLORS,
                    map: (colorOption, i) => {
                      const borderColorCss = op(colorIndex)
                        .equals(i)
                        .ternary("#999", "#f4f4f4");

                      return m.Span({
                        class: `pointer mb2 mr3 pa1 br-100 bw2 ba flex`,
                        style: tmpl`border-color: ${borderColorCss}`,
                        onclick: handleTap(() => updateColor(i)),
                        children: m.Span({
                          class: tmpl`pa2 br-100`,
                          style: `background-color: ${colorOption}`,
                        }),
                      });
                    },
                  }),
                }),
              }),
              Section({
                cssClasses: "pb3",
                title: "Status update levels",
                hideDescription: hideDescriptions,
                description: `
                  When updating a habit status in a day, we generally have only two levels - "${BASE_LEVELS[0]}"
                  or "${BASE_LEVELS[1]}". But a habit can have more than 2 levels as well.
                  Like for example, the habit of 'Drink 2 litres water daily'
                  should ideally have three levels - '0 litre', '1 litre' and '2 litres', from low to high.
                  You can add or remove levels by clicking on + or - buttons. Click on textbox
                  for editing the status level name. The levels from top to bottom should go from lowest
                  to the highest.`,
                children: m.For({
                  subject: levels,
                  map: (currentLevel, i) => {
                    const oldLevels = editableHabit?.value?.levels || [];
                    const newLevels = levels.value;
                    const { hideAddButton, hideRemoveButton } =
                      getAddRemoveButtonsVisibility(oldLevels, newLevels, i);
                    const textboxDisabled = levelTextboxDisability(
                      oldLevels,
                      newLevels,
                      i
                    );

                    return m.Div({
                      children: [
                        m.Div({
                          class: "flex items-center justify-between",
                          children: [
                            m.Div({
                              class:
                                "flex items-center ba bw1 b--light-silver br3 w-70 w-80-ns",
                              children: [
                                ColorDot({
                                  cssClasses: "w1 h2 br3 br--left ml1px",
                                  dotCssClasses: "br3 br--left",
                                  colorIndex,
                                  level: i,
                                  isRectangular: true,
                                  totalLevels: levels.value.length,
                                }),
                                TextBox({
                                  cssClasses: "bn pa2 br3 w-100 outline-0",
                                  placeholder: `Level ${i}`,
                                  disabled: textboxDisabled,
                                  text: currentLevel.name,
                                  onchange: (text) => updateLevel(text, i),
                                }),
                              ],
                            }),
                            AddRemoveButton({
                              hideAdd: hideAddButton,
                              hideRemove: hideRemoveButton,
                              onAdd: () => addLevel(i + 1),
                              onRemove: () => removeLevel(i),
                            }),
                          ],
                        }),
                        m.If({
                          subject: op(levels).lengthGT(i + 1).truthy,
                          isTruthy: () =>
                            m.Div({
                              class: "pa2 ml2 pl1 bl bw1 b--silver",
                            }),
                        }),
                      ],
                    });
                  },
                }),
              }),
              Section({
                title: "Habit completion goal",
                hideDescription: hideDescriptions,
                description: tmpl`
                  Goals are something for long-term. Let's say based on below table, after
                  a month or two, you followed your habit for 67% of the times, then you
                  just crossed the milestone - '${() =>
                    getAchievedMilestone(editedHabit.value.milestones, 67)
                      .label}'. For achieving your goal (in %), you can set your
                  own custom milestones depending on the difficulty of the habit.`,
                children: m.For({
                  subject: milestones,
                  n: 0,
                  nthChild: m.Div({
                    class: "mb1 ph2 pv0 bn bw1 relative ts-white-1",
                    children: [
                      m.Span({ class: "lh-copy", children: "" }),
                      m.Span({
                        class: `w-30 absolute mt3 right-2 bottom--1dot5 flex items-center z-1`,
                        children: [
                          m.Span({
                            class: `w-100 bg-white bn bw1 ph2dot5 di f4 b light-silver pb3 nl1`,
                            children: "100",
                          }),
                          m.Span({
                            class: "ph2 bg-white light-silver b pb3 mr1",
                            children: "%",
                          }),
                        ],
                      }),
                    ],
                  }),
                  map: (milestone, i) =>
                    m.Div({
                      class: `mb1 ph4 pv4 ba br3 bw1 b--light-gray relative`,
                      children: [
                        m.Span({
                          class: `lh-copy flex items-center`,
                          children: [
                            Icon({
                              cssClasses: `mr2 ${milestone.color}`,
                              size: 20,
                              iconName: milestone.icon,
                            }),
                            milestone.label,
                          ],
                        }),
                        m.Span({
                          class: `w-30 absolute mt3 right-2 bottom--1dot5 flex items-center z-1`,
                          children: [
                            m.If({
                              subject: i === 3,
                              isTruthy: () =>
                                m.Span({
                                  class: `w-100 bg-white bn bw1 br3 pa2dot5 di f4 b light-silver mb1`,
                                  children: "00",
                                }),
                              isFalsy: () =>
                                NumberBox({
                                  cssClasses: `w-100 ba bw1 b--light-silver br3 pa2dot5 di f5 b dark-gray`,
                                  num: milestone.percent,
                                  onchange: (value) =>
                                    updateMilestone(value, i),
                                }),
                            }),
                            m.Span({
                              class: "ph2 bg-white light-silver b",
                              children: "%",
                            }),
                          ],
                        }),
                      ],
                    }),
                }),
              }),
            ]),
        }),
        m.If({
          subject: showFullCustomisations,
          isFalsy: () =>
            Button({
              cssClasses: "pv2 ph3 flex items-center",
              onTap: () => (moreDetails.value = !moreDetails.value),
              children: [
                Icon({
                  cssClasses: "mr1",
                  iconName: customisationsButtonIcon,
                }),
                customisationsButtonLabel,
              ],
            }),
        }),
      ],
    });
  }
);
