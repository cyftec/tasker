import { compute } from "@cyftech/signal";
import { Child, component, m } from "@mufw/maya";
import { getNavbarLinks } from "../@common/transforms";
import { Scaffold } from "../@elements";
import { NavBar } from "./NavBar";

type NavScaffoldProps = {
  cssClasses?: string;
  header?: Child;
  content: Child;
  navbarTop?: Child;
  route: string;
};

export const NavScaffold = component<NavScaffoldProps>(
  ({ cssClasses, header, content, navbarTop, route }) => {
    return Scaffold({
      cssClasses: cssClasses,
      header: header,
      content: content,
      bottombar: m.Div({
        children: [
          m.If({
            subject: navbarTop,
            isTruthy: () => navbarTop,
          }),
          NavBar({
            cssClasses: "nl3 nr3 ph4",
            links: compute(getNavbarLinks, route),
          }),
        ],
      }),
    });
  }
);
