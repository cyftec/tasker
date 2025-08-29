import { derive, dispose, tmpl, trap } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { handleTap } from "../@common/utils";

type TabBarProps = {
  cssClasses?: string;
  tabs: { label: string; isSelected: boolean; classes?: string }[];
  onTabChange: (tabIndex: number) => void;
};

export const TabBar = component<TabBarProps>(
  ({ cssClasses, tabs, onTabChange }) => {
    const containerClasses = tmpl`bg-white br3 ${cssClasses}`;
    const tabsData = trap(tabs).map((tab) => {
      const tabSelectionCss = tab.isSelected
        ? `b--light-silver b black ${tab.classes || ""}`
        : "pointer b--transparent b--hover-black silver pointer";
      const tabClasses = `
                w-100 br3 pv2dot5 ph2 flex justify-center noselect br-pill ba bw1 bg-inherit
                ${tabSelectionCss} ${tab.classes}`;
      return {
        tabClasses,
        label: tab.label,
      };
    });

    return m.Div({
      onunmount: () => dispose(containerClasses, tabsData),
      class: containerClasses,
      children: m.Div({
        class: "flex items-center justify-between pa1",
        children: m.For({
          subject: tabsData,
          itemKey: "label",
          map: (tabObj, tabIndex) => {
            const { tabClasses, label } = trap(tabObj).props;
            return m.Span({
              onunmount: () => dispose(tabClasses, label),
              onclick: handleTap(() => onTabChange(tabIndex.value)),
              class: tabClasses,
              children: label,
            });
          },
        }),
      }),
    });
  }
);
