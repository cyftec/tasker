import { KvStore, KvStoreIDManager } from "../kv-store";
import {
  DbRecordID,
  DbUnsupportedType,
  InflatedRecord,
  TableKey,
} from "../models";
import { RecordIdMapper, RecordMapper } from "./record-mapping";
import { RecordValidation } from "./record-validation";

export type TableType = "structured" | "unstructured";

export type ForeignTableMapping = {
  type: "foreigntable";
  tableKey: TableKey;
  owned: boolean;
};
export type DbUnsupportedTypeMapping = { type: DbUnsupportedType };
export type TableFieldMapping = ForeignTableMapping | DbUnsupportedTypeMapping;

type TableGetter = (tableKey: TableKey) => Table<InflatedRecord<any>>;

type RecordMatcher<Inflated> = (record: Inflated) => boolean;

type RecordMappings<Inflated extends InflatedRecord<any>> = Partial<{
  [k in keyof Inflated]: TableFieldMapping;
}>;

type GetResponse<ReqIDs, Inflated> = undefined extends ReqIDs
  ? Inflated[]
  : ReqIDs extends DbRecordID
  ? Inflated | undefined
  : Inflated[];

export class Table<Inflated extends InflatedRecord<any>> {
  private kvStore: KvStore;
  private key: TableKey;
  private isUnstructured: boolean;
  private kvsIdManager: KvStoreIDManager;
  private getForeignTableFromKey: TableGetter;
  private mappings?: RecordMappings<Inflated>;
  type: TableType;

  constructor(
    kvStore: KvStore,
    tableKey: TableKey,
    tableType: TableType,
    getForeignTableFromKey: TableGetter,
    mappings?: RecordMappings<Inflated>
  ) {
    this.kvStore = kvStore;
    this.type = tableType;
    this.key = tableKey;
    this.isUnstructured = tableType === "unstructured";
    this.kvsIdManager = new KvStoreIDManager(kvStore);
    this.getForeignTableFromKey = getForeignTableFromKey;
    this.mappings = mappings;
  }

  private getAllIDs(): DbRecordID[] {
    const kvStoreKeys = this.kvStore.getAllKeys();
    const validIDs: DbRecordID[] = [];
    for (const id of kvStoreKeys) {
      const validDbRecordID = RecordIdMapper.fromKvsToDb(this.key, id);
      if (validDbRecordID === undefined) continue;
      validIDs.push(validDbRecordID);
    }
    return validIDs;
  }

  private getDeflatedRecord(id: DbRecordID): any {
    if (id === 0) throw `Record with id - '0' tried to be fetched.`;
    const kvsRecordKey = RecordIdMapper.fromDbToKvs(this.key, id);
    const kvsRecordValue = this.kvStore.getItem(kvsRecordKey);
    if (kvsRecordValue === undefined) return;
    const record = JSON.parse(kvsRecordValue);
    return record;
  }

  private getSingleRecord(id: DbRecordID): Inflated | undefined {
    let deflatedRecord = this.getDeflatedRecord(id);
    if (!deflatedRecord) return;

    return RecordMapper.fromDbToUiRecord(
      id,
      deflatedRecord,
      this.isUnstructured,
      this.getForeignTableFromKey,
      this.mappings
    ) as Inflated;
  }

  private getAllRecords(ids?: DbRecordID[]): Inflated[] {
    const validIDs: DbRecordID[] = ids?.length ? ids : this.getAllIDs();
    const records: Inflated[] = [];
    for (const id of validIDs) {
      const record = this.getSingleRecord(id);
      if (!record) continue;
      records.push(record);
    }
    return records;
  }

  get count() {
    return this.getAllIDs().length;
  }

  get<ReqIDs extends DbRecordID | DbRecordID[] | undefined>(
    requestedIDorIDs?: ReqIDs
  ): GetResponse<ReqIDs, Inflated> {
    return (
      typeof requestedIDorIDs === "number"
        ? this.getSingleRecord(requestedIDorIDs)
        : this.getAllRecords(requestedIDorIDs)
    ) as GetResponse<ReqIDs, Inflated>;
  }

  filter(recordMatcher: RecordMatcher<Inflated>, count?: number): Inflated[] {
    const validIDs: DbRecordID[] = this.getAllIDs();
    const matchingRecords: Inflated[] = [];
    const idsLength = validIDs.length;
    const recordsLength = count || idsLength;
    for (const id of validIDs) {
      const record = this.getSingleRecord(id);
      if (!record) continue;
      const recordMatched = recordMatcher(record);
      if (recordMatched) matchingRecords.push(record);
      if (matchingRecords.length === recordsLength) break;
    }
    return matchingRecords;
  }

  find(recordMatcher: RecordMatcher<Inflated>): Inflated | undefined {
    return this.filter(recordMatcher, 1)[0];
  }

  put(record: Inflated): Inflated {
    let recordID: DbRecordID = record.id;
    const isNewRecord = RecordValidation.isRecordNew(record);
    if (isNewRecord) RecordValidation.validateNewRecord(record, this);
    const sanitisedNewRecord: Inflated = {
      ...(isNewRecord ? {} : this.getDeflatedRecord(recordID) || {}),
      ...record,
    };

    const kvsMappedRecord = RecordMapper.fromUiToDbRecord(
      sanitisedNewRecord,
      this.isUnstructured,
      this.getForeignTableFromKey,
      this.mappings
    );
    const kvsRecordValue = JSON.stringify(kvsMappedRecord);

    const kvsRecordUpdator = (id: DbRecordID) => {
      const kvsRecordKey = RecordIdMapper.fromDbToKvs(this.key, id);
      this.kvStore.setItem(kvsRecordKey, kvsRecordValue);
    };

    if (recordID === 0) {
      recordID = this.kvsIdManager.useNewID(kvsRecordUpdator);
    } else {
      kvsRecordUpdator(recordID);
    }

    return this.get(recordID) as Inflated;
  }

  delete(dbRecordID: DbRecordID): void {
    const kvsRecordKey = RecordIdMapper.fromDbToKvs(this.key, dbRecordID);
    this.kvStore.removeItem(kvsRecordKey);
  }
}
