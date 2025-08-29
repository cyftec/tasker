import { dispose, tmpl } from "@cyftech/signal";
import { component, m } from "@mufw/maya";

type DividerProps = {
  cssClasses?: string;
};

export const Divider = component<DividerProps>(({ cssClasses }) => {
  const classes = tmpl`bb b--light-gray ${cssClasses}`;

  return m.Div({
    onunmount: () => dispose(classes),
    class: classes,
  });
});
