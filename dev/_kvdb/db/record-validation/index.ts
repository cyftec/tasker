import { InflatedRecord, InflatedUnstructuredRecord } from "../../models";
import { Table } from "../table";
import { Unstructured } from "../unstructured-record";

export class RecordValidation {
  static isRecordNew(record: any): boolean {
    if (record?.id) return false;
    return true;
  }

  static isRecordUnstructured(record: any): boolean {
    if (
      typeof record === "object" &&
      record !== null &&
      Object.keys(record).length === 2 &&
      Object.keys(record).includes("id") &&
      Object.keys(record).includes("value")
    )
      return true;
    return false;
  }

  static validateRecordStructure(
    record: InflatedRecord<any>,
    table: Table<any>
  ) {
    const isUnstructured = table.type === "unstructured";
    if (isUnstructured !== this.isRecordUnstructured(record))
      throw `InflatedUnstructuredRecord or Strucutured type is not matching with passed record. This table is defined as '${
        isUnstructured ? "InflatedUnstructuredRecord" : "Strucutured"
      }' while the record passed is of the '${
        isUnstructured ? "Strucutured" : "InflatedUnstructuredRecord"
      }' type.\n${JSON.stringify(record)}`;
  }

  static validateExistingUnstructuredRecord(
    record: InflatedUnstructuredRecord<any>,
    table: Table<any>
  ) {
    const existingRecord = table.find(
      (rec) =>
        Unstructured.getRecordValue(rec as InflatedUnstructuredRecord<any>) ===
        Unstructured.getRecordValue(record)
    );
    if (existingRecord)
      throw `A unstructured record with same value - ${JSON.stringify(
        record
      )} already exists.`;
  }

  static validateNewRecord(record: InflatedRecord<any>, table: Table<any>) {
    if (!this.isRecordNew(record)) throw `Not a new record`;
    this.validateRecordStructure(record, table);
    if (table.type === "unstructured")
      this.validateExistingUnstructuredRecord(
        record as InflatedUnstructuredRecord<any>,
        table
      );
  }
}
