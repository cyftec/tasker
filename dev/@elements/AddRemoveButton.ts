import { dispose, op, tmpl } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { handleTap } from "../@common/utils";

type AddRemoveButtonProps = {
  cssClasses?: string;
  hideRemove?: boolean;
  hideAdd?: boolean;
  onRemove: () => void;
  onAdd: () => void;
};

export const AddRemoveButton = component<AddRemoveButtonProps>(
  ({ cssClasses, hideRemove, hideAdd, onRemove, onAdd }) => {
    const containerBorderCss = op(hideRemove).and(hideAdd).ternary("bn", "ba");
    const containerClasses = tmpl`br3 pb1 f4 bw1 b--light-silver dark-gray ${containerBorderCss} ${cssClasses}`;
    const removeBtnBorderCss = op(hideAdd).ternary("", "br");
    const removeBtnClasses = tmpl`pointer ph2 pb1 bw1 b--light-silver ${removeBtnBorderCss}`;

    const onUnmount = () =>
      dispose(
        containerBorderCss,
        containerClasses,
        removeBtnBorderCss,
        removeBtnClasses
      );

    return m.Span({
      onunmount: onUnmount,
      class: containerClasses,
      children: [
        m.If({
          subject: hideRemove,
          isFalsy: () =>
            m.Span({
              class: removeBtnClasses,
              onclick: handleTap(onRemove),
              children: "-",
            }),
        }),
        m.If({
          subject: hideAdd,
          isFalsy: () =>
            m.Span({
              class: "pointer ph2 pb1",
              onclick: handleTap(onAdd),
              children: "+",
            }),
        }),
      ],
    });
  }
);
