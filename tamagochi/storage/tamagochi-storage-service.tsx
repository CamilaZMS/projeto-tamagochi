import { Tamagochi } from "@/types/tamagochi";
import { storage, storageKeys } from "./index";

export const tamagochiStorageService = {
  getTamagochis: async (): Promise<Tamagochi[]> => {
    const value = await storage.get<Tamagochi[]>(storageKeys.TAMAGOCHI_KEY);
    return value || [];
  },

  setTamagochis: async (tamagochis: Tamagochi[]): Promise<void> => {
    await storage.set(storageKeys.TAMAGOCHI_KEY, tamagochis);
  },

  addTamagochi: async (tamagochi: Tamagochi): Promise<void> => {
    const tamagochis = await tamagochiStorageService.getTamagochis();
    tamagochis.push(tamagochi);
    await tamagochiStorageService.setTamagochis(tamagochis);
  },

  getTamagochiById: async (id: string): Promise<Tamagochi | undefined> => {
    const tamagochis = await tamagochiStorageService.getTamagochis();
    return tamagochis.find((tamagochi) => tamagochi.id === id);
  },
};

export default tamagochiStorageService;
