import { dispose, tmpl, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { goToNewHabitsPage } from "../@common/utils";
import { Button, Icon } from "../@elements";

type AddHabitButtonProps = {
  cssClasses?: string;
  justifyCssClasses?: string;
  label?: string;
};

export const AddHabitButton = component<AddHabitButtonProps>(
  ({ cssClasses, justifyCssClasses, label }) => {
    const justifyCss = trap(justifyCssClasses).or("justify-end");
    const buttonLabel = trap(label).or(`Add habit`);
    const classes = tmpl`w-100 flex ${justifyCss} ${cssClasses}`;

    return m.Div({
      onunmount: () => dispose(justifyCss, buttonLabel, classes),
      class: classes,
      children: Button({
        cssClasses: "pa3 mb3 shadow-4 b flex items-center",
        children: [
          Icon({
            cssClasses: "nl1 mr1",
            size: 22,
            iconName: "add",
          }),
          buttonLabel,
        ],
        onTap: goToNewHabitsPage,
      }),
    });
  }
);
