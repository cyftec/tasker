import { KvStore } from ".";
import { TableRecordID } from "../models";

export class KvStoreIDManager {
  private kvStore: KvStore;

  constructor(kvStore: KvStore) {
    this.kvStore = kvStore;
  }

  getCurrentID(): TableRecordID {
    let maxID = this.kvStore.getItem("maxID");
    if (!maxID) this.kvStore.setItem("maxID", "0");
    maxID = this.kvStore.getItem("maxID");
    if (maxID === undefined)
      throw `Error setting and getting the value for key 'maxID' in KV Store.`;
    return +maxID;
  }

  useNewID(callback: (newId: TableRecordID) => void): TableRecordID {
    const newID = this.getCurrentID() + 1;
    callback(newID);
    this.kvStore.setItem("maxID", `${newID}`);
    return newID;
  }
}
