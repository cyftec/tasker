import { dispose, tmpl } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { Toggle } from "../../@elements";

type ToggleSettingProps = {
  cssClasses?: string;
  label: string;
  isToggleOn: boolean;
  onToggle: () => void;
};

export const ToggleSetting = component<ToggleSettingProps>(
  ({ cssClasses, label, isToggleOn, onToggle }) => {
    const classes = tmpl`flex items-center justify-between ${cssClasses}`;

    return m.Div({
      onunmount: () => dispose(classes),
      class: classes,
      children: [
        m.Div(label),
        Toggle({
          cssClasses: "ml3",
          isOn: isToggleOn,
          onToggle: onToggle,
        }),
      ],
    });
  }
);
