import { component, m } from "@mufw/maya";
import { AddHabitButton } from "../AddHabitButton";
import { dispose, tmpl } from "@cyftech/signal";

type EmptyHomePageIllustrationProps = {
  cssClasses?: string;
};

export const EmptyHomePageIllustration =
  component<EmptyHomePageIllustrationProps>(({ cssClasses }) => {
    const classes = tmpl`flex flex-column items-center justify-around ${cssClasses}`;

    return m.Div({
      onunmount: () => dispose(classes),
      class: classes,
      children: [
        m.Img({
          class: "mt3 pt4",
          src: "/assets/images/just_landed.png",
          height: "200",
        }),
        m.Div("Looks like, you just landed here!"),
        AddHabitButton({
          cssClasses: "pt5",
          justifyCssClasses: "justify-around",
          label: "Add your first habit",
        }),
      ],
    });
  });
