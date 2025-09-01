import { dispose, tmpl, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";

type ProgressBarProps = {
  cssClasses?: string;
  progress: number;
};

export const ProgressBar = component<ProgressBarProps>(
  ({ progress, cssClasses }) => {
    const classes = tmpl`br-pill bg-moon-gray ${cssClasses}`;
    const styles = tmpl`width: ${trap(progress).toConfined(0, 100)}%;`;

    return m.Div({
      onunmount: () => dispose(classes, styles),
      class: classes,
      children: m.Div({
        class: "br-pill bg-app-theme-color pa1",
        style: styles,
      }),
    });
  }
);
