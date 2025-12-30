import { KvStore, KvStoreIDManager } from "../kv-store";
import {
  TableRecordID,
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
  : ReqIDs extends TableRecordID
  ? Inflated | undefined
  : Inflated[];

export class Table<Inflated extends InflatedRecord<any>> {
  private kvStore: KvStore;
  private isUnstructured: boolean;
  private kvsIdManager: KvStoreIDManager;
  private getForeignTableFromKey: TableGetter;
  private mappings?: RecordMappings<Inflated>;
  key: TableKey;
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

  private iterateRecords(
    iterator: (thisTableRecordID: TableRecordID) => boolean
  ): void {
    let recordCount = 0;
    this.kvStore.iterate((kvsKey) => {
      const validTableRecordID = RecordIdMapper.fromKvsToDb(this.key, kvsKey);
      if (validTableRecordID === undefined) return true;
      recordCount++;
      const continueIterating = iterator(validTableRecordID);
      return continueIterating;
    });
  }

  private getDeflatedRecord(id: TableRecordID): any {
    if (id === 0) throw `Record with id - '0' tried to be fetched.`;
    const kvsRecordKey = RecordIdMapper.fromDbToKvs(this.key, id);
    const kvsRecordValue = this.kvStore.getItem(kvsRecordKey);
    if (kvsRecordValue === undefined) return;
    const record = JSON.parse(kvsRecordValue);
    return record;
  }

  private getSingleRecord(id: TableRecordID): Inflated | undefined {
    let deflatedRecord = this.getDeflatedRecord(id);
    if (!deflatedRecord) return;

    return RecordMapper.toInflated(
      id,
      deflatedRecord,
      this.isUnstructured,
      this.getForeignTableFromKey,
      this.mappings
    ) as Inflated;
  }

  private getAllRecords(ids?: TableRecordID[]): Inflated[] {
    const records: Inflated[] = [];
    const addRecord = (id: TableRecordID) => {
      const record = this.getSingleRecord(id);
      if (!record) return;
      records.push(record);
    };

    if (ids?.length) ids.forEach(addRecord);
    else
      this.iterateRecords((id) => {
        addRecord(id);
        return true;
      });

    return records;
  }

  get count() {
    let total = 0;
    this.iterateRecords((_) => !!++total);
    return total;
  }

  get<ReqIDs extends TableRecordID | TableRecordID[] | undefined>(
    requestedIDorIDs?: ReqIDs
  ): GetResponse<ReqIDs, Inflated> {
    return (
      typeof requestedIDorIDs === "number"
        ? this.getSingleRecord(requestedIDorIDs)
        : this.getAllRecords(requestedIDorIDs)
    ) as GetResponse<ReqIDs, Inflated>;
  }

  filter(recordMatcher: RecordMatcher<Inflated>, count?: number): Inflated[] {
    const matchingRecords: Inflated[] = [];
    this.iterateRecords((id) => {
      const record = this.getSingleRecord(id);
      if (!record) return true;
      const recordMatched = recordMatcher(record);
      if (recordMatched) matchingRecords.push(record);
      return count ? matchingRecords.length < count : true;
    });
    return matchingRecords;
  }

  find(recordMatcher: RecordMatcher<Inflated>): Inflated | undefined {
    return this.filter(recordMatcher, 1)[0];
  }

  put(inflatedRecord: Inflated): Inflated {
    let recordID: TableRecordID = inflatedRecord.id;
    const isNewRecord = RecordValidation.isRecordNew(inflatedRecord);
    if (isNewRecord) RecordValidation.validateNewRecord(inflatedRecord, this);

    const kvsMappedRecord = RecordMapper.toDeflated(
      inflatedRecord,
      this.isUnstructured,
      this.getForeignTableFromKey,
      this.mappings
    );
    const kvsRecordValue = JSON.stringify(kvsMappedRecord);

    const kvsRecordUpdator = (id: TableRecordID) => {
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

  delete(tableRecordID: TableRecordID): void {
    const kvsRecordKey = RecordIdMapper.fromDbToKvs(this.key, tableRecordID);
    this.kvStore.removeItem(kvsRecordKey);
  }
}
