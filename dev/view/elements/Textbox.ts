import { dispose, op } from "@cyftech/signal";
import {
  component,
  CustomEventValue,
  type DomEventValue,
  m,
  MHtmlElement,
} from "@mufw/maya";

type CustomKeyDownEvent = { key: string; text: string };

type TextBoxProps = {
  cssClasses?: string;
  placeholder?: string;
  disabled?: boolean;
  text: string;
  onmount?: CustomEventValue;
  onchange?: (value: string) => void;
  onkeydown?: (event: CustomKeyDownEvent) => void;
  onfocus?: () => void;
  onblur?: () => void;
};

export const TextBox = component<TextBoxProps>(
  ({
    cssClasses,
    placeholder,
    disabled,
    text,
    onmount,
    onchange,
    onkeydown,
    onfocus,
    onblur,
  }) => {
    let inputElem: MHtmlElement<HTMLInputElement>;
    const isDisabled = op(disabled).truthy;

    const onMount: CustomEventValue = (elem) => {
      inputElem = elem as MHtmlElement<HTMLInputElement>;
      if (onmount) onmount(elem);
    };

    const onTextChange = (e: KeyboardEvent) => {
      const value = (e.target as HTMLInputElement).value;
      if (onchange) onchange(value);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const finalText =
        e.key.length === 1
          ? inputElem.value + e.key
          : e.key === "Backspace"
          ? inputElem.value.slice(0, -1)
          : inputElem.value;
      const event: CustomKeyDownEvent = {
        key: e.key,
        text: finalText,
      };
      if (onkeydown) onkeydown(event);
    };

    return m.Input({
      onmount: onMount,
      onunmount: () => dispose(isDisabled),
      class: cssClasses,
      type: "text",
      placeholder,
      disabled: isDisabled,
      value: text,
      onchange: onTextChange as DomEventValue,
      onkeydown: onKeyDown as DomEventValue,
      onfocus,
      onblur,
    });
  }
);
