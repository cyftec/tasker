import {
  DbRecordID,
  KvsRecordKey,
  KvsRecordKeyPrefix,
  TableKey,
} from "../../models";

export class RecordIdMapper {
  private static parseNum(str: string) {
    return Number.isNaN(+str) ? undefined : +str;
  }

  private static getKvsRecordKeyPrefix(tableKey: TableKey): KvsRecordKeyPrefix {
    return `${tableKey}_`;
  }

  static fromKvsToDb(
    tableKey: TableKey,
    kvStoreKey: string
  ): DbRecordID | undefined {
    const recordIDPrefix = this.getKvsRecordKeyPrefix(tableKey);
    if (!kvStoreKey.startsWith(recordIDPrefix)) return;
    const recordIdStr = kvStoreKey.split(recordIDPrefix)[1] || "";
    return this.parseNum(recordIdStr);
  }

  static fromDbToKvs(tableKey: TableKey, dbRecordID: DbRecordID): KvsRecordKey {
    const recordIDPrefix = this.getKvsRecordKeyPrefix(tableKey);
    return `${recordIDPrefix}${dbRecordID}`;
  }
}
