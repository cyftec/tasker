import { dispose, op, tmpl } from "@cyftech/signal";
import { Children, component, m } from "@mufw/maya";
import { handleTap } from "../../controllers/utils";

type LinkProps = {
  cssClasses?: string;
  href?: string;
  target?: string;
  onClick?: () => void;
  children: Children;
};

export const Link = component<LinkProps>(
  ({ cssClasses, href, target, onClick, children }) => {
    const linkCss = op(href).or(onClick).ternary("pointer underline", "");
    const classes = tmpl`noselect ${linkCss} ${cssClasses}`;

    return m.A({
      onunmount: () => dispose(linkCss, classes),
      ...(href ? { href } : {}),
      class: classes,
      target,
      onclick: handleTap(onClick),
      children,
    });
  }
);
