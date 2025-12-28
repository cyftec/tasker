import { KvStore, LOCALSTORAGE_AS_KVSTORE, StorageDetails } from "../kv-store";
import { InflatedRecord, TableKey } from "../models";
import { Table, TableFieldMapping, TableType } from "./table";

export type DatabaseSchema = {
  [TableName in string]: {
    key: TableKey;
    type: TableType;
    structure: InflatedRecord<any>;
    mappings?: Record<string, TableFieldMapping>;
  };
};

export type DatabaseInstance<Schema extends DatabaseSchema> = {
  _meta: {
    storage: StorageDetails;
  };
} & {
  [TableName in keyof Schema]: Table<Schema[TableName]["structure"]>;
};

export const openDb = <Schema extends DatabaseSchema>(
  schema: Schema,
  migration?: () => void,
  kvStore?: KvStore
): DatabaseInstance<Schema> => {
  const store: KvStore = kvStore || LOCALSTORAGE_AS_KVSTORE;
  const dbInstance: DatabaseInstance<Schema> = {
    _meta: {
      get storage() {
        return store.getStorageDetails();
      },
    },
  } as DatabaseInstance<Schema>;

  const getTableFromTableKey = (key: TableKey) => {
    const tableName = Object.keys(schema).find(
      (tblName) => schema[tblName]["key"] === key
    );
    if (!tableName)
      throw `Invalid key '${key}' passed to find table name from schema - '${JSON.stringify(
        schema
      )}'`;
    const table = dbInstance[tableName];
    if (!table) throw `Table with key '${key}' not found in the DB`;
    return table;
  };

  Object.entries(schema).forEach(([tableName, tableDetails]) => {
    try {
      const { key: tableKey, type: tableType, mappings } = tableDetails;
      const table = new Table(
        store,
        tableKey,
        tableType,
        getTableFromTableKey,
        mappings
      );
      dbInstance[tableName as keyof Schema] =
        table as DatabaseInstance<Schema>[keyof Schema];
    } catch (error) {
      console.log(`error happened during building table - ${tableName}`);
    }
  });
  if (migration) migration();

  return dbInstance as DatabaseInstance<Schema>;
};
