export type SettingsV0 = {
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

export type AnalyticsV0 = {
  id: "analytics";
  lastInteraction: number;
};
