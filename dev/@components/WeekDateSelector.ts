import { compute, derive, dispose, op, tmpl } from "@cyftech/signal";
import { component, m } from "@mufw/maya";
import {
  areSameDates,
  getWeekdayName,
  isFutureDay,
} from "../@common/transforms";
import { handleTap } from "../@common/utils";

type WeekDateSelectorProps = {
  date: Date;
  selectedDate: Date;
  onChange: (selectedDate: Date) => void;
};

export const WeekDateSelector = component<WeekDateSelectorProps>(
  ({ date, selectedDate, onChange }) => {
    const isFuture = compute(isFutureDay, date);
    const isSelectedDay = compute(areSameDates, selectedDate, date);
    const futureBasedCss = op(isFuture).ternary(
      "light-gray b--transparent",
      "light-silver pointer b--transparent"
    );
    const colorsCss = op(isSelectedDay).ternary(
      "black b b--silver",
      futureBasedCss
    );
    const dayTileClasses = tmpl`bw1 ba br-pill ph2 pv3 pb2 tc ${colorsCss}`;
    const weekdayLabel = derive(() => getWeekdayName(date.value.getDay(), 3));
    const dateLabel = derive(() => ("0" + date.value.getDate()).slice(-2));

    const onDateSelect = () => {
      if (isSelectedDay.value || isFuture.value) return;
      onChange(date.value);
    };

    const onUnmount = () =>
      dispose(
        isFuture,
        isSelectedDay,
        futureBasedCss,
        colorsCss,
        dayTileClasses,
        weekdayLabel,
        dateLabel
      );

    return m.Div({
      onunmount: onUnmount,
      class: dayTileClasses,
      onclick: handleTap(onDateSelect),
      children: [
        m.Div({
          class: "f7 ",
          children: weekdayLabel,
        }),
        m.Div({
          class: "mt2 f4",
          children: dateLabel,
        }),
      ],
    });
  }
);
