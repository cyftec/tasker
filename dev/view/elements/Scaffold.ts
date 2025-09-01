import { dispose, tmpl } from "@cyftech/signal";
import { Child, component, m } from "@mufw/maya";

type ScaffoldProps = {
  cssClasses?: string;
  header?: Child;
  content: Child;
  bottombar?: Child;
};

export const Scaffold = component<ScaffoldProps>(
  ({ cssClasses, header, content, bottombar }) => {
    const classes = tmpl`w6-ns ${cssClasses}`;

    return m.Div({
      onunmount: () => dispose(classes),
      class: "flex-ns justify-center-ns",
      children: m.Div({
        class: classes,
        children: [
          m.If({
            subject: header,
            isTruthy: () =>
              m.Div({
                class:
                  "overflow-break-word sticky top-0 left-0 right-0 bg-inherit z-999 f2dot33 b pv3 mt2",
                children: header,
              }),
          }),
          content,
          m.Div({ class: "pv6 mt5" }),
          m.If({
            subject: bottombar,
            isTruthy: () =>
              m.Div({
                class: "sticky bottom-0 left-0 right-0 z-9999",
                children: bottombar,
              }),
          }),
        ],
      }),
    });
  }
);
