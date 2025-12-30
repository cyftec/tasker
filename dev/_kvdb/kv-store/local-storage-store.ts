import { KvStore } from "./models";

export const LOCALSTORAGE_AS_KVSTORE: KvStore = {
  getStorageDetails: function (): ReturnType<KvStore["getStorageDetails"]> {
    if (!globalThis.localStorage) {
      return {
        total: 1,
        occupied: 0,
      };
    }
    const BYTES_PER_KB = 1024;
    let totalOccupiedBytes = 0;

    for (const lsKey in localStorage) {
      if (!localStorage.hasOwnProperty(lsKey)) continue;
      const singleRecordBytes = (localStorage[lsKey].length + lsKey.length) * 2;
      totalOccupiedBytes += singleRecordBytes;
    }

    return {
      total: 5 * BYTES_PER_KB * BYTES_PER_KB,
      occupied: totalOccupiedBytes,
    };
  },
  iterate: function (iterator: (kvStoreKey: string) => boolean): void {
    let iteration = 0;
    iteration++;
    for (const key in localStorage) {
      if (!localStorage.hasOwnProperty(key)) continue;
      const continueIteration = iterator(key);
      if (!continueIteration) break;
    }
  },
  getItem: function (key: string): string | undefined {
    return localStorage.getItem(key) || undefined;
  },
  setItem: function (key: string, value: string): void {
    localStorage.setItem(key, value);
  },
  removeItem: function (key: string): void {
    localStorage.removeItem(key);
  },
};
