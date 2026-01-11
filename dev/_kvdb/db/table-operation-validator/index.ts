import {
  InflatedRecord,
  InflatedUnstructuredRecord,
  TableRecordID,
} from "../../models";
import { Table } from "../table";
import { Unstructured } from "../unstructured-record";

export class ValidateTableOperation<Inflated extends InflatedRecord<any>> {
  private table: Table<Inflated>;

  constructor(table: Table<Inflated>) {
    this.table = table;
  }

  private validateCorrectRecordFormat(record: object): void {
    if (typeof record !== "object") throw `The record is not an 'object'`;
    if (record === null) throw `The value of passed record is 'null'`;

    const idMissingInRecord = !("id" in record);
    if (idMissingInRecord) throw `ID is missing from record object`;
  }

  private isRecordUnstructured(record: any): boolean {
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

  private validateRecordStructure(record: Inflated) {
    const isUnstructured = this.table.isUnstructured;

    if (this.isRecordUnstructured(record) !== isUnstructured)
      throw `InflatedUnstructuredRecord or Strucutured type is not matching with passed record. This table is defined as '${
        isUnstructured ? "InflatedUnstructuredRecord" : "Strucutured"
      }' while the record passed is of the '${
        isUnstructured ? "Strucutured" : "InflatedUnstructuredRecord"
      }' type.\n${JSON.stringify(record)}`;
  }

  private validateIncomingRecord(record: Inflated) {
    this.validateCorrectRecordFormat(record);
    this.validateRecordStructure(record);
  }

  getOperation(ids?: TableRecordID | TableRecordID[]) {
    if (typeof ids === "number" && ids === 0)
      throw `Record with id - '0' tried to be fetched.`;
    if (Array.isArray(ids)) {
      ids.forEach((id) => {
        if (typeof id !== "number")
          throw `ID '${id}' in list of IDs passed is not a number`;

        if (id === 0)
          throw `Record with id - '0' tried to be fetched, is present in list of IDs.`;
      });
    }
  }

  addOperation(inflatedRecord: Inflated) {
    this.validateIncomingRecord(inflatedRecord);
    if (inflatedRecord.id !== 0)
      throw `The 'id' value should be 0 for a adding new record, found '${inflatedRecord.id}'.`;

    if (this.table.isUnstructured) {
      const recordDeflatedValue = Unstructured.getRecordValue(
        inflatedRecord as InflatedUnstructuredRecord<any>
      );
      const existingRecord = this.table.find(
        (rec) =>
          Unstructured.getRecordValue(
            rec as InflatedUnstructuredRecord<any>
          ) === recordDeflatedValue
      );
      if (existingRecord)
        throw `A unstructured record with same value - ${JSON.stringify(
          recordDeflatedValue
        )} already exists.`;
    }
  }

  updateOperation(inflatedRecord: Inflated) {
    this.validateIncomingRecord(inflatedRecord);
    if (inflatedRecord.id === 0)
      throw `The 'id' value should NOT be 0 for updating the record.`;
  }

  deleteOperation(tableRecordID: TableRecordID) {
    const found = this.table.get(tableRecordID);
    if (!found)
      throw `Record with ID - '${tableRecordID}' not found for delete.`;
  }
}
