import {
  InflatedUnstructuredRecord,
  UNSTRUCTURED_RECORD_VALUE_KEY,
} from "../../models";

export class Unstructured {
  static getRecordValue<T>(record: InflatedUnstructuredRecord<T>) {
    return record[UNSTRUCTURED_RECORD_VALUE_KEY];
  }

  static newRecord<T>(value: T): InflatedUnstructuredRecord<T> {
    return {
      id: 0,
      value,
    };
  }
}
