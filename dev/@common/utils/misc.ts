import { updateInteractionTime } from "../localstorage";

const vibrateOnTap = () => {
  if (!!window.navigator?.vibrate) {
    window.navigator.vibrate(3);
  }
};

export const parseObjectJsonString = <T extends Object>(
  objectJsonString: string | null | undefined,
  uniquePropKey: string,
  nonNullUniquePropValue?: any
): T | undefined => {
  const obj: T = JSON.parse(objectJsonString || "{}");
  const isObject = obj && typeof obj === "object";
  const uniquePropValue = obj[uniquePropKey];
  const matchesSignature = nonNullUniquePropValue
    ? uniquePropValue === nonNullUniquePropValue
    : !!uniquePropValue;

  if (!isObject || !matchesSignature) return;
  return obj;
};

export const handleTap = (fn: ((...args: any[]) => any) | undefined) => {
  return (...args: any) => {
    vibrateOnTap();
    updateInteractionTime(new Date());
    return fn && fn(...args);
  };
};
