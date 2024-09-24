import { Tamagochi } from "@/types/tamagochi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageKeys = {
  TAMAGOCHI_KEY: "tamagochi-key",
};

export const storage = {
  get: async <T,>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log("Erro ao buscar dados no storage: ", e);
      return null;
    }
  },
  set: async <T,>(key: string, value: T): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.log("Erro ao salvar dados no storage: ", e);
    }
  },
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.log("Erro ao remover dados do storage: ", e);
    }
  },
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.log("Erro ao limpar todos os dados do storage: ", e);
    }
  },
};
