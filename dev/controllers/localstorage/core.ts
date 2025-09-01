export const validLocalStorageKeys = () => {
  const lsKeys: string[] = [];
  for (const key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) {
      continue;
    }
    lsKeys.push(key);
  }

  return lsKeys;
};
