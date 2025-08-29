import { phase } from "@mufw/maya/utils";
import { INITIAL_SETTINGS, INITIAL_STORAGE_DATA } from "../constants";
import { LocalSettings, StorageDetails } from "../types";
import { parseObjectJsonString } from "../utils";
import { validLocalStorageKeys } from "./core";
import { validHabitRecordKey } from "./habits";

const LS_SETTINGS_KEY = "settings";
const LS_SETTINGS_ID_KEY = "id";
const LS_SETTINGS_ID_VALUE = "local-settings";

export const updateSettings = (settings: LocalSettings) => {
  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
};

export const fetchSettings = (): LocalSettings => {
  if (!phase.currentIs("run")) return INITIAL_SETTINGS;

  const getSettingsFromStore = () => {
    const settingsString = localStorage.getItem(LS_SETTINGS_KEY);
    const settingsObject = parseObjectJsonString<LocalSettings>(
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
  addFutureUpgradesIfMissing(settings);

  return getSettingsFromStore() as LocalSettings;
};

export const addFutureUpgradesIfMissing = (settings: LocalSettings) => {
  // v1 upgrade
  if (!settings.editPage) {
    updateSettings({
      ...settings,
      editPage: INITIAL_SETTINGS.editPage,
    });
  }
};

export const getStorageSpaceData = (): StorageDetails => {
  const storageData: StorageDetails = INITIAL_STORAGE_DATA;
  if (!phase.currentIs("run")) return storageData;

  const BYTES_PER_KB = 1024;
  let totalBytes = 0;
  const getKbFromBytes = (bytes: number) => bytes / BYTES_PER_KB;
  for (const lsKey of validLocalStorageKeys()) {
    const singleRecordBytes = (localStorage[lsKey].length + lsKey.length) * 2;
    const documentKey = validHabitRecordKey(lsKey) ? "habits" : lsKey;

    totalBytes += singleRecordBytes;
    storageData.documents[documentKey] =
      (storageData.documents[documentKey]
        ? storageData.documents[documentKey]
        : 0) + singleRecordBytes;
  }

  storageData.total = getKbFromBytes(totalBytes);
  storageData.spaceLeft =
    (100 * (5 * 1024 * 1024 - totalBytes)) / (5 * 1024 * 1024);

  return storageData;
};
