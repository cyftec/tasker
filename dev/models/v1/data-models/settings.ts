import { InflatedUnstructuredRecord } from "../../../_kvdb";

export type Settings = InflatedUnstructuredRecord<{
  analytics: {
    lastInteraction: number;
  };
  habitsPage: {
    tabIndex: number;
    sortOptionIndex: number;
  };
  editPage: {
    showHints: boolean;
    showFullCustomisation: boolean;
  };
}>;

export const INITIAL_SETTINGS: Settings = {
  id: 0,
  value: {
    analytics: {
      lastInteraction: new Date().getTime(),
    },
    habitsPage: {
      tabIndex: 0,
      sortOptionIndex: 0,
    },
    editPage: {
      showHints: false,
      showFullCustomisation: false,
    },
  },
};
