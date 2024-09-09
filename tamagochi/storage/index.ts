import { MMKV } from "react-native-mmkv";

const mmkvStorage = new MMKV();

export const storageKeys = {
  TAMAGOCHI_KEY: "tamagochi-key",
};

export const storage = {
  get: <T>(key: string): T | null => {
    const value = mmkvStorage.getString(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  },

  set: <T>(key: string, value: T): void => {
    mmkvStorage.set(key, JSON.stringify(value));
  },

  remove: (key: string): void => {
    mmkvStorage.delete(key);
  },

  clearAll: (): void => {
    mmkvStorage.clearAll();
  },
};
