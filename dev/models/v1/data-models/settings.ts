import { InflatedStructuredRecord } from "../../../_kvdb";

export type Settings = {
  habitsPage: {
    tabIndex: number;
    sortOptionIndex: number;
  };
  editPage: {
    showHints: boolean;
    showFullCustomisation: boolean;
  };
};

export type PageName = "editPage" | "habitsPage";
export type Setting<Page extends keyof Settings> = InflatedStructuredRecord<{
  page: Page;
  data: Pick<Settings, Page>[Page];
}>;

export type StorageDetails = {
  total: number;
  spaceLeft: number;
  documents: Record<string, number>;
};
