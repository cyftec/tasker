import {
  DB_UNSUPPORTED_TYPES,
  InflatedRecord,
  DbRecordID,
  DbUnsupportedType,
  NumBoolean,
  DeflatedStructuredRecord,
  InflatedStructuredRecord,
  TableKey,
  InflatedUnstructuredRecord,
  WithID,
  DeflatedRecord,
  ID_KEY,
  UNSTRUCTURED_RECORD_VALUE_KEY,
} from "../../models";
import { Table, TableFieldMapping } from "../table";
import { RecordValidation } from "../record-validation";
import { Unstructured } from "../unstructured-record";

export const getJsValue = (
  dbValue: number | undefined,
  jsType: DbUnsupportedType
) => {
  // dbValue can only be one of DbUnsupportedType
  if (typeof dbValue === "number" && jsType === "date") {
    return new Date(dbValue);
  }
  if (typeof dbValue === "number" && jsType === "bool") {
    return !!dbValue;
  }
  return dbValue;
};

type ReturnType<In> = In extends Date
  ? number
  : In extends boolean
  ? NumBoolean
  : In;
export const getDbValue = <ForeignDbRecord extends Date | boolean | undefined>(
  jsValue: ForeignDbRecord
): ReturnType<ForeignDbRecord> => {
  if (jsValue instanceof Date) {
    return jsValue.getTime() as ReturnType<typeof jsValue>;
  }
  if (typeof jsValue === "boolean") {
    return +jsValue as ReturnType<typeof jsValue>;
  }
  return jsValue as ReturnType<typeof jsValue>;
};

export const getExtendedValue = (
  table: Table<InflatedRecord<any>>,
  rawValue?: DbRecordID | DbRecordID[]
) => {
  // rawValue can only be undefined | DbRecordID | DbRecordID[]
  if (typeof rawValue === "number") return table.get(rawValue as DbRecordID);
  if (Array.isArray(rawValue)) {
    return rawValue.length ? table.get(rawValue as DbRecordID[]) : rawValue;
  }
  return rawValue;
};

export const getForeignDbRecordIdValues = <ForeignDbRecord extends object>(
  foreignTable: Table<InflatedRecord<any>>,
  extendedValue: WithID<ForeignDbRecord> | WithID<ForeignDbRecord>[] | undefined
) => {
  if (Array.isArray(extendedValue)) {
    return extendedValue.map((rec) => {
      if (rec.id) return rec.id;
      if (rec.id === undefined) throw "Invalid extended foreign values list";
      const newCreatedRecord = foreignTable.put(rec);
      return newCreatedRecord.id;
    });
  }
  if (typeof extendedValue === "object" && extendedValue !== null) {
    if (extendedValue.id) return extendedValue.id;
    if (extendedValue.id === undefined) throw "Invalid extended foreign value";
    const newCreatedRecord = foreignTable.put(extendedValue);
    return newCreatedRecord.id;
  }
  return extendedValue;
};

export const getMappedObject = (
  /**
   * If the converted type is nested deep within the record (object),
   * pass the path as ["nestedLevel1", "nestedLeve2"..."nestedLevelN"]
   * for the object
   * const obj = {
   *   ...,
   *   nestedLevel1: {
   *     ...,
   *     nestedLevel2: {
   *       nestedLevel3: valueWhichNeedsConversion,
   *     }
   *   }
   * }
   */
  keysPath: string,
  obj: Record<string, any>,
  valueConverter: (value: any) => any
): Record<string, any> => {
  const separator = ".";
  if (typeof obj !== "object" || obj === null) return obj;

  if (!keysPath.includes(separator))
    return { ...obj, [keysPath]: valueConverter(obj[keysPath]) };

  const firstKey = keysPath.split(".")[0];
  const restPath = keysPath.split(".").slice(1).join(".");
  const value = obj[firstKey];
  //It supports arrayed objects as well
  const mappedValue = Array.isArray(value)
    ? value.map((o) => getMappedObject(restPath, o as object, valueConverter))
    : getMappedObject(restPath, value as object, valueConverter);

  return { ...obj, [firstKey]: mappedValue };
};

export class RecordMapper {
  static fromUiToDbRecord<T extends InflatedRecord<any>>(
    record: T,
    isUnstructured: boolean,
    getForeignTableFromKey: (tableKey: TableKey) => Table<InflatedRecord<any>>,
    mappings?: Partial<{
      [k in keyof T]: TableFieldMapping;
    }>
  ): DeflatedRecord<T> {
    if (isUnstructured) {
      if (!RecordValidation.isRecordUnstructured(record))
        throw "Record is not an unstructured one as specified in the table";
      return Unstructured.getRecordValue(
        record as InflatedUnstructuredRecord<any>
      );
    }

    delete (record as DeflatedStructuredRecord<any>).id;
    if (!mappings) return record as DeflatedRecord<T>;

    Object.entries(mappings).forEach(
      ([keysPath, mapping]: [string, TableFieldMapping]) => {
        if (mapping.type === "foreigntable") {
          const foreignTable = getForeignTableFromKey(mapping.tableKey);
          record = getMappedObject(keysPath, record, (rawValue) =>
            getForeignDbRecordIdValues(foreignTable, rawValue)
          ) as T;
        }

        if (DB_UNSUPPORTED_TYPES.includes(mapping.type as DbUnsupportedType)) {
          record = getMappedObject(keysPath, record, getDbValue) as T;
        }
      }
    );
    return record as DeflatedRecord<T>;
  }

  static fromDbToUiRecord<T>(
    id: DbRecordID,
    record: T,
    isUnstructured: boolean,
    getForeignTableFromKey: (tableKey: TableKey) => Table<InflatedRecord<any>>,
    mappings?: Partial<{
      [k in keyof InflatedStructuredRecord<object>]: TableFieldMapping;
    }>
  ): InflatedRecord<T> {
    if (isUnstructured) {
      return {
        [ID_KEY]: id,
        [UNSTRUCTURED_RECORD_VALUE_KEY]: record,
      } as InflatedRecord<T>;
    }

    if (!mappings) return { id, ...record } as InflatedRecord<T>;

    Object.entries(mappings).forEach(
      ([keysPath, mapping]: [string, TableFieldMapping]) => {
        if (mapping.type === "foreigntable") {
          const foreignTable = getForeignTableFromKey(mapping.tableKey);
          record = getMappedObject(keysPath, record as object, (rawValue) =>
            getExtendedValue(foreignTable, rawValue)
          ) as T;
        }

        if (DB_UNSUPPORTED_TYPES.includes(mapping.type as DbUnsupportedType)) {
          record = getMappedObject(keysPath, record as object, (rawValue) =>
            getJsValue(rawValue, mapping.type as DbUnsupportedType)
          ) as T;
        }
      }
    );
    return { id, ...record } as InflatedRecord<T>;
  }
}
