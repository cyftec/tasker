import { component, m } from "@mufw/maya";
import { Button, Icon } from "../@elements";
import { dispose, tmpl } from "@cyftech/signal";

type GoBackButtonProps = {
  cssClasses?: string;
};

export const GoBackButton = component<GoBackButtonProps>(({ cssClasses }) => {
  const classes = tmpl`pa3 flex items-center ${cssClasses}`;

  return Button({
    onUnmount: () => dispose(classes),
    cssClasses: classes,
    children: [
      Icon({ iconName: "arrow_back" }),
      m.Span({
        class: "ml1",
        children: `Go Back`,
      }),
    ],
    onTap: () => history.back(),
  });
});
