import { dispose, tmpl } from "@cyftech/signal";
import { Children, component, m } from "@mufw/maya";
import { handleTap } from "../@common/utils";

type ButtonProps = {
  cssClasses?: string;
  onTap: () => void;
  onUnmount?: () => void;
  children: Children;
};

export const Button = component<ButtonProps>(
  ({ cssClasses, onTap, onUnmount, children }) => {
    const btnClasses = tmpl`pointer noselect br-pill ba bw1 b--light-silver b--hover-black bg-white black ${cssClasses}`;

    const onBtnUnmount = () => {
      dispose(btnClasses);
      if (onUnmount) onUnmount();
    };

    return m.Button({
      onunmount: onBtnUnmount,
      class: btnClasses,
      onclick: handleTap(() => onTap()),
      children: children,
    });
  }
);
