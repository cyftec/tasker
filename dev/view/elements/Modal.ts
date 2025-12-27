import { tmpl, effect, dispose } from "@cyftech/signal";
import { type Children, component, m, MHtmlElement } from "@mufw/maya";
import { handleTap } from "../../controllers/utils";

type ModalProps = {
  cssClasses?: string;
  isOpen: boolean;
  content: Children;
  onTapOutside?: () => void;
  onUnmount?: () => void;
};

export const Modal = component<ModalProps>(
  ({ cssClasses, isOpen, content, onTapOutside, onUnmount }) => {
    const classes = tmpl`pa0 br3 ${cssClasses}`;

    const onDialogMount = (dialogElem: MHtmlElement<HTMLElement>) => {
      setTimeout(() =>
        effect(() => {
          if (isOpen.value)
            (dialogElem as MHtmlElement<HTMLDialogElement>).showModal();
          else (dialogElem as MHtmlElement<HTMLDialogElement>).close();
        })
      );
    };

    const onDialogUnmount = () => {
      dispose(classes);
      if (onUnmount) onUnmount();
    };

    return m.Dialog({
      onmount: onDialogMount,
      onunmount: onDialogUnmount,
      onclick: handleTap(onTapOutside),
      class: classes,
      children: [
        m.Div({
          onclick: (e: Event) => e.stopPropagation(),
          children: content,
        }),
      ],
    });
  }
);
