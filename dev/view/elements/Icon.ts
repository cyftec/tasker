import { dispose, tmpl, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { handleTap } from "../../controllers/utils";

type IconProps = {
  cssClasses?: string;
  size?: number;
  iconName: string;
  onClick?: () => void;
  title?: string;
};

export const Icon = component<IconProps>(
  ({ cssClasses, size, onClick, iconName, title }) => {
    const pointerCss = !!onClick ? "pointer" : "";
    const classes = tmpl`material-symbols-outlined ${pointerCss} ${cssClasses}`;
    const fontSize = trap(size).or(16);
    const styles = tmpl`font-size: ${fontSize}px`;

    return m.Span({
      onunmount: () => dispose(classes, fontSize, styles),
      class: classes,
      style: styles,
      onclick: handleTap(onClick),
      children: iconName,
      title: title,
    });
  }
);
