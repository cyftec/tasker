import { dispose, trap } from "@cyftech/signal";
import { component, type DomEventValue, m } from "@mufw/maya";

type NumberBoxProps = {
  cssClasses?: string;
  placeholder?: string;
  num: number;
  onchange: (value: number) => void;
};

export const NumberBox = component<NumberBoxProps>(
  ({ cssClasses, placeholder, num, onchange }) => {
    const stringValue = trap(num).string;

    const onTextChange = (e: KeyboardEvent) => {
      const text = (e.target as HTMLInputElement).value;
      const numValue = Number.parseFloat(
        Number.parseFloat(text || "0").toFixed(2)
      );
      onchange(numValue);
    };

    return m.Input({
      onunmount: () => dispose(stringValue),
      class: cssClasses,
      type: "number",
      placeholder,
      value: stringValue,
      onchange: onTextChange as DomEventValue,
    });
  }
);
