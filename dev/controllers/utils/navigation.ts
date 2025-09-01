import { phase } from "@mufw/maya/utils";

const APP = {
  href: "/",
  HABITS: {
    href: "/habits/",
    NEW: { href: "/habits/new/" },
    HABIT: {
      href: "/habits/habit/",
      EDIT: { href: "/habits/habit/edit/" },
    },
  },
  SETTINGS: {
    href: "/settings/",
    PRIVACY_POLICY: { href: "/settings/privacy-policy/" },
  },
};

export const goToHref = (href: string) => (location.href = href);
export const goToHomePage = () => (location.href = APP.href);
export const goToHabitsPage = () => (location.href = APP.HABITS.href);
export const goToNewHabitsPage = () => (location.href = APP.HABITS.NEW.href);
export const goToHabitPage = (habitId: number) =>
  (location.href = `${APP.HABITS.HABIT.href}?id=${habitId}`);
export const goToHabitEditPage = (habitId: number) =>
  (location.href = `${APP.HABITS.HABIT.EDIT.href}?id=${habitId}`);
export const goToSettingsPage = () => (location.href = APP.SETTINGS.href);
export const goToPrivacyPolicyPage = () =>
  (location.href = APP.SETTINGS.PRIVACY_POLICY.href);

export const getQueryParamValue = (queryParamKey: string) => {
  if (!phase.currentIs("run")) return "";
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  return urlParams.get(queryParamKey) || "";
};
