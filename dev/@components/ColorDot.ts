import {
  compute,
  tmpl,
  SignalifiedObject,
  trap,
  op,
  dispose,
} from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import { getColorsForLevel } from "../@common/transforms";
import { handleTap } from "../@common/utils";
import { Icon } from "../@elements";

type ColorDotProps = {
  cssClasses?: string;
  dotCssClasses?: string;
  colorIndex: number;
  level: number;
  totalLevels: number;
  textColor?: string;
  showText?: boolean;
  textContent?: string;
  icon?: string;
  iconSize?: number;
  isRectangular?: boolean;
  showHeight?: boolean;
  onClick?: () => void;
};

export const ColorDot = component<ColorDotProps>(
  ({
    cssClasses,
    dotCssClasses,
    colorIndex,
    level,
    totalLevels,
    showText,
    textContent,
    icon,
    iconSize,
    isRectangular,
    showHeight,
    onClick,
  }) => {
    const outerBorder = op(isRectangular).ternary("br0", "br-100");
    const outerBg = op(level)
      .isLT(0)
      .ternary("bg-transparent", "bg-light-gray");
    const colorsData = compute(
      getColorsForLevel,
      level,
      totalLevels,
      colorIndex,
      showText
    );
    const { peakBackgroundColor, backgroundColor, fontColor, levelPercent } =
      trap(colorsData).props;
    const text = trap(textContent).or("·");
    const showIcon = op(showHeight)
      .and(icon)
      .andThisIsGT(levelPercent, 99).truthy;
    const classes = tmpl`pointer relative overflow-hidden ${outerBorder} ${outerBg} ${cssClasses}`;
    const heightedDotClass = tmpl`flex items-center justify-around absolute left-0 right-0 bottom-0 br0 ${dotCssClasses}`;
    const heightedDotStyle = tmpl`
      background-color: ${peakBackgroundColor};
      color: white;
      height: ${levelPercent}%;`;
    const gradientDotClass = tmpl`flex items-center justify-around absolute absolute--fill ${dotCssClasses}`;
    const gradientDotStyle = tmpl`
      background-color: ${backgroundColor};
      color: ${fontColor};`;

    const onTap = () => {
      if (onClick && level.value >= 0) onClick();
    };

    const onUnmount = () => {
      dispose(
        outerBorder,
        outerBg,
        colorsData,
        peakBackgroundColor,
        backgroundColor,
        fontColor,
        levelPercent,
        text,
        showIcon,
        classes,
        heightedDotClass,
        heightedDotStyle,
        gradientDotClass,
        gradientDotStyle
      );
    };

    return m.Span({
      onunmount: onUnmount,
      class: classes,
      onclick: handleTap(onTap),
      children: m.If({
        subject: showHeight,
        isTruthy: () =>
          m.Span({
            class: heightedDotClass,
            style: heightedDotStyle,
            children: m.If({
              subject: showIcon,
              isTruthy: () =>
                Icon({
                  iconName: icon as SignalifiedObject<string>,
                  size: iconSize,
                }),
            }),
          }),
        isFalsy: () =>
          m.Span({
            class: gradientDotClass,
            style: gradientDotStyle,
            children: m.If({
              subject: icon,
              isTruthy: (subject) =>
                Icon({
                  iconName: subject,
                  size: iconSize,
                }),
              isFalsy: () => m.Span(text),
            }),
          }),
      }),
    });
  }
);
