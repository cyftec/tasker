import { InflatedUnstructuredRecord } from "../../../_kvdb";

export type Analytics = InflatedUnstructuredRecord<{
  lastInteraction: number;
}>;
