import { InflatedStructuredRecord } from "../../../_kvdb";

export type Settings = {
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
};

export type SettingType = keyof Settings;
export type Setting<SType extends SettingType> = InflatedStructuredRecord<{
  type: SType;
  data: Pick<Settings, SType>[SType];
}>;
