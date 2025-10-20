import { KvStore, LOCALSTORAGE_AS_KVSTORE } from "../kv-store";
import { InflatedRecord, TableKey } from "../models";
import { Table, TableFieldMapping, TableType } from "./table";

export type DatabaseSchema<> = {
  [TableName in string]: {
    key: TableKey;
    type: TableType;
    structure: InflatedRecord<any>;
    mappings?: Record<string, TableFieldMapping>;
  };
};

export type DB<Schema extends DatabaseSchema> = {
  [TableName in keyof Schema]: Table<Schema[TableName]["structure"]>;
};

export const openDb = <Schema extends DatabaseSchema>(
  schema: Schema,
  migrations?: () => void,
  kvStore?: KvStore
): DB<Schema> => {
  const store: KvStore = kvStore || LOCALSTORAGE_AS_KVSTORE;
  const db: DB<Schema> = {} as DB<Schema>;

  const getTableFromTableKey = (key: TableKey) => {
    const tableName = Object.keys(schema).find(
      (tblName) => schema[tblName]["key"] === key
    );
    if (!tableName)
      throw `Invalid key '${key}' passed to find table name from schema - '${JSON.stringify(
        schema
      )}'`;
    const table = db[tableName];
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
      db[tableName as keyof DB<Schema>] = table;
    } catch (error) {
      console.log(`error happened during building table - ${tableName}`);
    }
  });

  return db as DB<Schema>;
};
