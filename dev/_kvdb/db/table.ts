import { KvStore, KvStoreIDManager } from "../kv-store";
import {
  InflatedRecord,
  TableFieldMapping,
  TableKey,
  TableRecordID,
  TableType,
  UNSTRUCTURED_TABLE_TYPES,
  UnstructuredTableType,
} from "../models";
import { RecordIdMapper, RecordTransformer } from "./record-mapping";
import { ValidateTableOperation } from "./table-operation-validator";

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
  private tableKey: TableKey;
  isUnstructured: boolean;
  newItem: Inflated;
  private kvsIdManager: KvStoreIDManager;
  private validate: ValidateTableOperation<Inflated>;
  private getForeignTableFromKey: TableGetter;
  private mappings?: RecordMappings<Inflated>;

  constructor(
    kvStore: KvStore,
    getForeignTableFromKey: TableGetter,
    tableKey: TableKey,
    tableType: TableType,
    newItem: Inflated,
    mappings?: RecordMappings<Inflated>
  ) {
    this.kvStore = kvStore;
    this.tableKey = tableKey;
    this.isUnstructured = UNSTRUCTURED_TABLE_TYPES.includes(
      tableType as UnstructuredTableType
    );
    this.newItem = newItem;
    this.kvsIdManager = new KvStoreIDManager(kvStore);
    this.getForeignTableFromKey = getForeignTableFromKey;
    this.mappings = mappings;
    this.validate = new ValidateTableOperation(this);
  }

  private iterateRecords(
    iterator: (thisTableRecordID: TableRecordID) => boolean
  ): void {
    let recordCount = 0;
    this.kvStore.iterate((kvsKey) => {
      const validTableRecordID = RecordIdMapper.fromKvsToDb(
        this.tableKey,
        kvsKey
      );
      if (validTableRecordID === undefined) return true;
      recordCount++;
      const continueIterating = iterator(validTableRecordID);
      return continueIterating;
    });
  }

  private getDeflatedRecord(id: TableRecordID): any {
    const kvsRecordKey = RecordIdMapper.fromDbToKvs(this.tableKey, id);
    const kvsRecordValue = this.kvStore.getItem(kvsRecordKey);
    if (kvsRecordValue === undefined) return;
    const record = JSON.parse(kvsRecordValue);
    return record;
  }

  private getSingleRecord(id: TableRecordID): Inflated | undefined {
    let deflatedRecord = this.getDeflatedRecord(id);
    if (!deflatedRecord) return;

    return RecordTransformer.toInflated(
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

  private put(inflatedRecord: Inflated, isNew: boolean): Inflated {
    let recordID: TableRecordID = inflatedRecord.id;
    const kvsRecord = RecordTransformer.toDeflated(
      inflatedRecord,
      this.getForeignTableFromKey,
      this.mappings
    );
    const kvsRecordValue = JSON.stringify(kvsRecord);

    const kvsRecordUpdator = (id: TableRecordID) => {
      const kvsRecordKey = RecordIdMapper.fromDbToKvs(this.tableKey, id);
      this.kvStore.setItem(kvsRecordKey, kvsRecordValue);
    };

    if (isNew) {
      recordID = this.kvsIdManager.useNewID(kvsRecordUpdator);
    } else {
      kvsRecordUpdator(recordID);
    }

    return this.get(recordID) as Inflated;
  }

  get count() {
    let total = 0;
    this.iterateRecords((_) => !!++total);
    return total;
  }

  get<ReqIDs extends TableRecordID | TableRecordID[] | undefined>(
    requestedIDorIDs?: ReqIDs
  ): GetResponse<ReqIDs, Inflated> {
    this.validate.getOperation(requestedIDorIDs);
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

  add(inflatedRecord: Inflated): Inflated {
    this.validate.addOperation(inflatedRecord);
    return this.put(inflatedRecord, true);
  }

  update(inflatedRecord: Inflated): Inflated {
    this.validate.updateOperation(inflatedRecord);
    return this.put(inflatedRecord, false);
  }

  delete(tableRecordID: TableRecordID): void {
    this.validate.deleteOperation(tableRecordID);
    const kvsRecordKey = RecordIdMapper.fromDbToKvs(
      this.tableKey,
      tableRecordID
    );
    this.kvStore.removeItem(kvsRecordKey);
  }
}
