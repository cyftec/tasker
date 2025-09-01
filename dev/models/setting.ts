import { Structured } from "@cyftec/kvdb";

export type LocalSettings = {
  id: "local-settings";
  habitsPage: {
    tabIndex: number;
    sortOptionIndex: number;
  };
  editPage: {
    showHints: boolean;
    showFullCustomisation: boolean;
  };
};
export type Analytics = {
  id: "analytics";
  lastInteraction: number;
};

export type StorageDetails = {
  total: number;
  spaceLeft: number;
  documents: Record<string, number>;
};

export type SettingType = "HABITS_PAGE" | "EDIT_PAGE";

export type SingleSetting = {};

// export type Setting = Structured<Record<>>;
