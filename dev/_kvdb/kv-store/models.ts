export type StorageDetails = {
  total: number | null;
  occupied: number;
};

export type KvStore = {
  getStorageDetails: () => StorageDetails;
  getAllKeys: () => string[];
  getItem: (key: string) => string | undefined;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};
