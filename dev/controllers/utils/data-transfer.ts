const getKeysFromLocalStroage = (): object => {
  const lsKeys: string[] = [];
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) lsKeys.push(key);
  }
  return lsKeys;
};

const getDataFromStroage = (): object => {
  const data: Record<string, any> = {};
  for (const key in getKeysFromLocalStroage()) {
    const itemValue = localStorage.getItem(key) as string;
    data[key] = JSON.parse(itemValue);
  }
  return data;
};

const saveDataToStroage = (data: Record<string, any>) => {
  for (const key in data) {
    const itemData = data[key];
    const value = JSON.stringify(itemData);
    localStorage.setItem(key, value);
  }
};

const validateJsonData = (data: Record<string, any>) => {
  const validJson = "analytics" in data && "settings" in data;
  if (!validJson)
    throw `Either the JSON file is corrupted or not a valid JSON file for habits data.`;
};

export const HABITS_DATA_FILENAME = "habits-data.json";

export const saveAppDataAsFile = () => {
  const dataContent = JSON.stringify(getDataFromStroage());
  const file = new File([dataContent], HABITS_DATA_FILENAME, {
    type: "application/json",
  });
  const fileUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = HABITS_DATA_FILENAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(fileUrl);
};

export const loadNewAppDataFromFile = (stringifiedJSON: string) => {
  const data = JSON.parse(stringifiedJSON);
  validateJsonData(data);
  localStorage.clear();
  saveDataToStroage(data);
};
