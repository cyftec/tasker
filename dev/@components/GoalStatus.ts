import { compute, dispose, op, tmpl, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { AchievedMilestone, MilestonesUI } from "../@common/types";

type GoalStatusProps = {
  cssClasses?: string;
  milestones: MilestonesUI;
  achievedMilestone: AchievedMilestone;
  completionPercent: number;
};

export const GoalStatus = component<GoalStatusProps>(
  ({ cssClasses, milestones, achievedMilestone, completionPercent }) => {
    const achievedMilestoneColor = trap(achievedMilestone).prop("color");
    const completionLabel = compute(
      (comp: number) =>
        comp > 53
          ? "Average completion"
          : comp > 43
          ? "Avg completion"
          : comp > 35
          ? "Completion"
          : "",
      completionPercent
    );
    const classes = tmpl`center ${cssClasses}`;
    const completionElemCss = tmpl`nt3dot6 h1dot2 bw1 relative br b--${achievedMilestoneColor}`;
    const completionElemStyle = tmpl`width: ${completionPercent}%;`;
    const completionBarCss = tmpl`absolute right-0 pr1 b f6 ${achievedMilestoneColor}`;
    const completionBarPercent = tmpl`${completionPercent}%`;

    const onUnmount = () =>
      dispose(
        achievedMilestoneColor,
        completionLabel,
        classes,
        completionElemCss,
        completionElemStyle,
        completionBarCss,
        completionBarPercent
      );

    return m.Div({
      onunmount: onUnmount,
      class: classes,
      children: [
        m.Div({
          class: "pb2 w-100 relative",
          children: m.For({
            subject: milestones,
            map: (milestone, i) => {
              return CrossSection({
                colorCss: `bg-${milestone.color}`,
                percent: milestone.upperLimit,
                hideUpperLimit: i === 0,
              });
            },
          }),
        }),
        m.Div({
          class: completionElemCss,
          style: completionElemStyle,
          children: m.Div({
            class: `relative flex items-start nt1 justify-between f7 mid-gray`,
            children: [
              m.Div(completionLabel),
              m.Div({
                class: completionBarCss,
                children: completionBarPercent,
              }),
            ],
          }),
        }),
      ],
    });
  }
);

type CrossSectionProps = {
  colorCss: string;
  percent: number;
  hideUpperLimit?: boolean;
};

const CrossSection = component<CrossSectionProps>(
  ({ colorCss, hideUpperLimit, percent }) => {
    const percentLabel = op(hideUpperLimit).ternary("", tmpl`${percent}%`);
    const widthStyle = tmpl`width: ${percent}%;`;
    const bottomElemCss = tmpl`absolute absolute-fill h0dot15 w-100 ${colorCss}`;

    return m.Div({
      onunmount: () => dispose(percentLabel, widthStyle, bottomElemCss),
      class: "absolute flex items-start h0dot5 bl br b--light-silver bw1",
      style: widthStyle,
      children: [
        m.Div({ class: bottomElemCss }),
        m.Div({
          class: "flex justify-end w-100 pt2 f7",
          children: m.Div({
            class: "nr3 pb2 light-silver b",
            children: percentLabel,
          }),
        }),
      ],
    });
  }
);
