import {
  DB_UNSUPPORTED_TYPES,
  DbUnsupportedType,
  DeflatedRecord,
  DeflatedStructuredRecord,
  ID_KEY,
  InflatedRecord,
  InflatedStructuredRecord,
  NumBoolean,
  TableFieldMapping,
  TableKey,
  TableRecordID,
  UNSTRUCTURED_RECORD_VALUE_KEY,
  WithID,
} from "../../models";
import { Table } from "../table";

const isValueDate = (dateOrDateString: any) => {
  if (dateOrDateString instanceof Date) return true;
  if (!isNaN(new Date(dateOrDateString).getTime())) return true;
  return false;
};

const getDate = (dateOrDateString: string | Date): Date => {
  if (!isValueDate(dateOrDateString))
    throw `Input value is not a date or date string`;
  if (dateOrDateString instanceof Date) return dateOrDateString;
  return new Date(dateOrDateString);
};

export const getDeflatedForeignIds = <ForeignDbRecord extends object>(
  inflatedValue:
    | WithID<ForeignDbRecord>
    | WithID<ForeignDbRecord>[]
    | undefined,
  foreignTable: Table<InflatedRecord<any>>
): TableRecordID | TableRecordID[] | undefined => {
  if (Array.isArray(inflatedValue)) {
    return inflatedValue.map((rec) => {
      if (rec.id) return rec.id;
      if (rec.id === undefined) throw "Invalid extended foreign values list";
      const newCreatedRecord = foreignTable.add(rec);
      return newCreatedRecord.id;
    });
  }
  if (typeof inflatedValue === "object" && inflatedValue !== null) {
    if (inflatedValue.id) return inflatedValue.id;
    if (inflatedValue.id === undefined) throw "Invalid extended foreign value";
    const newCreatedRecord = foreignTable.add(inflatedValue);
    return newCreatedRecord.id;
  }
  return inflatedValue;
};

type ReturnType<In> = In extends Date
  ? number
  : In extends boolean
  ? NumBoolean
  : In;
export const getDeflatedUnsupportedValues = <
  ForeignDbRecord extends Date | boolean | undefined
>(
  inflatedValue: ForeignDbRecord,
  unsupportedType: DbUnsupportedType
): ReturnType<ForeignDbRecord> => {
  if (unsupportedType === "date") {
    console.log(typeof inflatedValue);
    console.log(inflatedValue);
  }
  if (unsupportedType === "date" && isValueDate(inflatedValue)) {
    return getDate(inflatedValue as string | Date).getTime() as ReturnType<
      typeof inflatedValue
    >;
  }
  if (unsupportedType === "date" && Array.isArray(inflatedValue)) {
    return inflatedValue.map((d) => {
      if (!isValueDate(d)) throw `Invalid values in supposedly array of dates.`;
      return d.getTime();
    }) as ReturnType<typeof inflatedValue>;
  }
  if (unsupportedType === "bool" && typeof inflatedValue === "boolean") {
    return +inflatedValue as ReturnType<typeof inflatedValue>;
  }
  if (unsupportedType === "bool" && Array.isArray(inflatedValue)) {
    return inflatedValue.map((b) => {
      if (!(typeof b === "boolean"))
        throw `Invalid values in supposedly array of booleans`;
      return +b;
    }) as ReturnType<typeof inflatedValue>;
  }
  return inflatedValue as ReturnType<typeof inflatedValue>;
};

export const getInflatedForeignRecords = <Inflated extends InflatedRecord<any>>(
  deflatedValue: TableRecordID | TableRecordID[] | undefined,
  table: Table<Inflated>
): Inflated | Inflated[] | undefined => {
  // deflatedValue can only be undefined | TableRecordID | TableRecordID[]
  if (typeof deflatedValue === "number")
    return table.get(deflatedValue as TableRecordID);
  if (Array.isArray(deflatedValue)) {
    return table.get(deflatedValue as TableRecordID[]);
  }
  return deflatedValue;
};

export const getInflatedUnsupportedValues = (
  deflatedValue: number | undefined,
  unsupportedType: DbUnsupportedType
): Date | Date[] | boolean | boolean[] | undefined => {
  // deflatedValue can only be one of DbUnsupportedType
  if (unsupportedType === "date" && typeof deflatedValue === "number") {
    return new Date(deflatedValue);
  }
  if (unsupportedType === "bool" && typeof deflatedValue === "number") {
    return !!deflatedValue;
  }
  if (unsupportedType === "date" && Array.isArray(deflatedValue)) {
    return deflatedValue.map((date) => new Date(date));
  }
  if (unsupportedType === "bool" && Array.isArray(deflatedValue)) {
    return deflatedValue.map((numBool) => !!numBool);
  }
  return deflatedValue as undefined;
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

export class RecordTransformer {
  static toDeflated<T extends InflatedRecord<any>>(
    record: T,
    getForeignTableFromKey: (tableKey: TableKey) => Table<InflatedRecord<any>>,
    mappings?: Partial<{
      [k in keyof T]: TableFieldMapping;
    }>
  ): DeflatedRecord<T> {
    delete (record as DeflatedStructuredRecord<any>).id;
    if (!mappings) return record as DeflatedRecord<T>;

    Object.entries(mappings).forEach(
      ([keysPath, mapping]: [string, TableFieldMapping]) => {
        if (mapping.type === "foreigntable") {
          const foreignTable = getForeignTableFromKey(mapping.tableKey);
          record = getMappedObject(keysPath, record, (inflatedValue) =>
            getDeflatedForeignIds(inflatedValue, foreignTable)
          ) as T;
        }

        if (DB_UNSUPPORTED_TYPES.includes(mapping.type as DbUnsupportedType)) {
          record = getMappedObject(keysPath, record, (inflatedValue) =>
            getDeflatedUnsupportedValues(
              inflatedValue,
              mapping.type as DbUnsupportedType
            )
          ) as T;
        }
      }
    );
    return record as DeflatedRecord<T>;
  }

  static toInflated<T>(
    id: TableRecordID,
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
          record = getMappedObject(
            keysPath,
            record as object,
            (deflatedValue) =>
              getInflatedForeignRecords(deflatedValue, foreignTable)
          ) as T;
        }

        if (DB_UNSUPPORTED_TYPES.includes(mapping.type as DbUnsupportedType)) {
          record = getMappedObject(
            keysPath,
            record as object,
            (deflatedValue) =>
              getInflatedUnsupportedValues(
                deflatedValue,
                mapping.type as DbUnsupportedType
              )
          ) as T;
        }
      }
    );
    return { id, ...record } as InflatedRecord<T>;
  }
}
