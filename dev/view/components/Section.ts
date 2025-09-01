import { dispose, op, tmpl } from "@cyftech/signal";
import { Children, component, m } from "@mufw/maya";

type SectionProps = {
  cssClasses?: string;
  contentCssClasses?: string;
  title: string;
  description?: string;
  hideDescription?: boolean;
  children: Children;
};

export const Section = component<SectionProps>(
  ({
    cssClasses,
    contentCssClasses,
    title,
    description,
    hideDescription,
    children,
  }) => {
    const classes = tmpl`mt3 mb4 ${cssClasses}`;
    const showDescription = op(description).andNot(hideDescription).truthy;

    return m.Div({
      onunmount: () => dispose(classes, showDescription),
      class: classes,
      children: [
        m.Div({
          class: "mb2 dark-gray f4 b",
          children: title,
        }),
        m.If({
          subject: showDescription,
          isTruthy: () =>
            m.Div({
              class: "mb3 f6 silver fw5",
              children: description,
            }),
        }),
        m.Div({ class: contentCssClasses, children }),
      ],
    });
  }
);
