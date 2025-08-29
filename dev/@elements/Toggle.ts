import { dispose, tmpl } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { handleTap } from "../@common/utils";

type ToggleProps = {
  cssClasses?: string;
  isOn: boolean;
  onToggle?: () => void;
};

export const Toggle = component<ToggleProps>(
  ({ cssClasses, isOn, onToggle }) => {
    const classes = tmpl`flex items-center pointer noselect br-pill ba bw1dot5 b--mid-gray b--hover-black bg-white pa05 black ${cssClasses}`;
    const circleCss = `br-100 ba bw1 b--hover-black pa1`;
    const leftCircleClasses = tmpl`${circleCss} ${() =>
      isOn.value ? "b--transparent" : "b--moon-gray bg-moon-gray"}`;
    const rightCircleClasses = tmpl`${circleCss} ${() =>
      isOn.value ? "b--mid-gray bg-mid-gray" : "b--transparent"}`;

    return m.Div({
      onunmount: () => dispose(classes, leftCircleClasses, rightCircleClasses),
      class: classes,
      onclick: handleTap(onToggle),
      children: [
        m.Div({ class: leftCircleClasses }),
        m.Div({ class: "pa05" }),
        m.Div({ class: rightCircleClasses }),
      ],
    });
  }
);
