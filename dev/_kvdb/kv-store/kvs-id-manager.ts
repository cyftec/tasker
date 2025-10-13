import { KvStore } from ".";
import { DbRecordID } from "../models";

export class KvStoreIDManager {
  private kvStore: KvStore;

  constructor(kvStore: KvStore) {
    this.kvStore = kvStore;
  }

  getCurrentID(): DbRecordID {
    let maxID = this.kvStore.getItem("maxID");
    if (!maxID) this.kvStore.setItem("maxID", "0");
    maxID = this.kvStore.getItem("maxID");
    if (maxID === undefined)
      throw `Error setting and getting the value for key 'maxID' in KV Store.`;
    return +maxID;
  }

  useNewID(callback: (newId: DbRecordID) => void): DbRecordID {
    const newID = this.getCurrentID() + 1;
    callback(newID);
    this.kvStore.setItem("maxID", `${newID}`);
    return newID;
  }
}
