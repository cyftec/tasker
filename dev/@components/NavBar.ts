import { dispose, op, tmpl } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { goToHref, handleTap } from "../@common/utils";
import { Icon } from "../@elements";
import { NavbarLink } from "../@common/types";

type NavBarProps = {
  cssClasses?: string;
  links: NavbarLink[];
};

export const NavBar = component<NavBarProps>(({ cssClasses, links }) => {
  const classes = tmpl`flex items-center justify-between pv3 bg-near-white ${cssClasses}`;

  return m.Div({
    onunmount: () => dispose(classes),
    class: classes,
    children: m.For({
      subject: links,
      map: (link) =>
        NavBarLink({
          label: link.label,
          icon: link.icon,
          isSelected: link.isSelected,
          href: link.href,
        }),
    }),
  });
});

type NavBarLinkProps = {
  cssClasses?: string;
  label: string;
  icon: string;
  isSelected: boolean;
  href: string;
};

export const NavBarLink = component<NavBarLinkProps>(
  ({ cssClasses, label, icon, isSelected, href }) => {
    const fontColor = op(isSelected).ternary("app-theme-color b", "black");
    const classes = tmpl`pointer noselect flex flex-column items-center justify-center pb2 ${fontColor} ${cssClasses}`;

    return m.Div({
      onunmount: () => dispose(fontColor, classes),
      class: classes,
      onclick: handleTap(() => goToHref(href.value)),
      children: [
        Icon({ size: 22, iconName: icon }),
        m.Div({ class: "f7", children: label }),
      ],
    });
  }
);
