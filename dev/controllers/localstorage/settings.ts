import { phase } from "@mufw/maya/utils";
import { SettingsV0 } from "../../models/v0";
import { INITIAL_SETTINGS } from "../constants";
import { parseObjectJsonString } from "../utils";

const LS_SETTINGS_KEY = "settings";
const LS_SETTINGS_ID_KEY = "id";
const LS_SETTINGS_ID_VALUE = "local-settings";

export const updateSettings = (settings: SettingsV0) => {
  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
};

export const fetchSettings = (): SettingsV0 => {
  if (!phase.currentIs("run")) return INITIAL_SETTINGS;

  const getSettingsFromStore = () => {
    const settingsString = localStorage.getItem(LS_SETTINGS_KEY);
    const settingsObject = parseObjectJsonString<SettingsV0>(
      settingsString,
      LS_SETTINGS_ID_KEY,
      LS_SETTINGS_ID_VALUE
    );
    return settingsObject;
  };

  const settingsObject = getSettingsFromStore();
  if (!settingsObject) updateSettings(INITIAL_SETTINGS);
  const settings = getSettingsFromStore();
  if (!settings) throw `Error fetching settings`;

  return getSettingsFromStore() as SettingsV0;
};
