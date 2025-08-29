import { derive, tmpl, signal, trap, op, dispose } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { HOMEPAGE_SORT_OPTIONS } from "../@common/constants";
import { handleTap } from "../@common/utils";
import { Icon, Modal } from "../@elements";

type SortOptionsProps = {
  cssClasses?: string;
  iconSize?: number;
  selectedOptionIndex: number;
  onChange: (optionIndex: number) => void;
};

export const SortOptions = component<SortOptionsProps>(
  ({ cssClasses, iconSize, selectedOptionIndex, onChange }) => {
    const isSortingOptionsModalOpen = signal(false);
    const selectedOption = derive(
      () => HOMEPAGE_SORT_OPTIONS[selectedOptionIndex.value]
    );
    const isDescending = trap(selectedOption).prop("decending");
    const iconName = trap(selectedOption).prop("icon");
    const safeIconSize = trap(iconSize).or(20);

    const openModal = () => (isSortingOptionsModalOpen.value = true);
    const closeModal = () => (isSortingOptionsModalOpen.value = false);

    const getOptionCss = (optionLabel: string) =>
      optionLabel === selectedOption.value.label
        ? "bg-near-white black fw6"
        : "gray fw5";

    const onOptionTap = (optionIndex: number) => {
      onChange(optionIndex);
      closeModal();
    };

    return m.Div({
      onunmount: () =>
        dispose(selectedOption, isDescending, iconName, safeIconSize),
      class: cssClasses,
      children: [
        SortIcon({
          cssClasses: "pointer",
          descending: isDescending,
          iconName: iconName,
          size: safeIconSize,
          onClick: openModal,
        }),
        Modal({
          cssClasses: "f5 normal ba bw0 outline-0",
          isOpen: isSortingOptionsModalOpen,
          onTapOutside: closeModal,
          content: m.Div({
            children: [
              m.Div({
                class: "f5 b tc pv3",
                children: "Sort habit cards by",
              }),
              m.Div({
                class: "f5 mb1",
                children: m.For({
                  subject: HOMEPAGE_SORT_OPTIONS,
                  map: (option, optionIndex) =>
                    m.Div({
                      class: `pointer flex items-center pv3 pl2 pr3 bt b--moon-gray ${getOptionCss(
                        option.label
                      )}`,
                      onclick: handleTap(() => onOptionTap(optionIndex)),
                      children: [
                        SortIcon({
                          cssClasses: "ml1 mr2",
                          descending: option.decending,
                          iconName: option.icon,
                          size: 20,
                        }),
                        m.Span(option.label),
                      ],
                    }),
                }),
              }),
            ],
          }),
        }),
      ],
    });
  }
);

type SortIconProps = {
  cssClasses?: string;
  descending: boolean;
  iconName: string;
  size: number;
  onClick?: () => void;
};

const SortIcon = component<SortIconProps>(
  ({ cssClasses, descending, iconName, size, onClick }) => {
    const pointerCss = onClick ? "pointer" : "";
    const arrowIconName = op(descending).ternary(
      "arrow_upward",
      "arrow_downward"
    );
    // (size.value * 4) / 5
    const arrowIconSize = op(size).mul(4).div(5).result;

    return m.Span({
      class: tmpl`flex items-center ${pointerCss} ${cssClasses}`,
      onclick: handleTap(onClick),
      children: [
        Icon({
          cssClasses: "silver",
          iconName: arrowIconName,
          size: arrowIconSize,
        }),
        Icon({
          size: size,
          iconName: iconName,
        }),
      ],
    });
  }
);
