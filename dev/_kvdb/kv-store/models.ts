export type KvStore = {
  getAllKeys: () => string[];
  getItem: (key: string) => string | undefined;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};
