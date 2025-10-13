export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
export type NumBoolean = 0 | 1;

export const ID_KEY = "id" as const satisfies string;
export const UNSTRUCTURED_RECORD_VALUE_KEY = "value" as const satisfies string;

export type IDKey = typeof ID_KEY;
export type UnstructuredRecordValueKey = typeof UNSTRUCTURED_RECORD_VALUE_KEY;
export type DbRecordID = number;
export type TableKey = string;
export type KvsRecordKeyPrefix = `${TableKey}_`;
export type KvsRecordKey = `${KvsRecordKeyPrefix}${DbRecordID}`;
export type DbUnsupportedType = "date" | "bool";
export const DB_UNSUPPORTED_TYPES: DbUnsupportedType[] = ["date", "bool"];

export type WithID<Record extends object> = {
  [K in IDKey]: DbRecordID;
} & Record;

/**
 * The 'Strucutred' record means any record in 'object' fromat
 * which has a repetitive structure like in SQL or noSQL databases,
 * and all the records in db have a same TypeScript object structure.
 *
 * For 'Inflated' naming, @see InflatedRecord
 */

export type InflatedStructuredRecord<Record extends object> = Prettify<
  WithID<Record>
>;

/**
 * The 'Unstrucutred' record means the record can be of any format
 * which is non-repetitive and can be of unique or duplicate values.
 * The best example of this record type is a string record for
 * tags table. The table will only store strings as each tag.
 * An object or array can also be saved as an unstructured
 * (read non-repetitive, but not necessarily unique) record.
 *
 * For 'Inflated' naming, @see InflatedRecord
 */

export type InflatedUnstructuredRecord<Record> = Prettify<
  WithID<{
    [K in UnstructuredRecordValueKey]: Record;
  }>
>;

/**
 * The 'Inflated' naming suggests that the record incoming
 * from app to be stored in db is inflated with all the nested
 * values in completely full state. It also suggests that the
 * records before being saved to DB will be deflated which means
 * any foreign table (record) value will be converted to their
 * respective record id(s).
 */

export type InflatedRecord<Record> = Record extends object
  ? InflatedStructuredRecord<Record> | InflatedUnstructuredRecord<Record>
  : InflatedUnstructuredRecord<Record>;

export type DeflatedStructuredRecord<
  T extends InflatedStructuredRecord<object>
> = {
  [K in keyof T]: K extends IDKey ? never : T[K];
};

export type DeflatedUnstructuredRecord<
  T extends InflatedUnstructuredRecord<any>
> = T["value"];

/**
 * The 'Deflated' naming suggests that the record being stored
 * in db is deflated which means any foreign table (record) value
 * will be converted to their respective record id(s). There are
 * some other deflations as well e.g. converting date object to
 * its number (date.getTime()) format before saving to the DB.
 * It also suggests that the records fetched from DB will be
 * inflated before sending them back to the app layer, which means
 * any foreign table (record) IDs will be converted to their
 * respective fully structured record values.
 */

export type DeflatedRecord<T extends InflatedRecord<any>> =
  T extends InflatedUnstructuredRecord<any>
    ? DeflatedUnstructuredRecord<T>
    : T extends InflatedStructuredRecord<object>
    ? DeflatedStructuredRecord<T>
    : never;
