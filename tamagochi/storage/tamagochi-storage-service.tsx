import { Tamagochi } from "@/types/tamagochi";
import { storage, storageKeys } from "./index";

export const tamagochiStorageService = {
  getTamagochis: (): Tamagochi[] => {
    const value = storage.get<Tamagochi[]>(storageKeys.TAMAGOCHI_KEY);
    return value || [];
  },

  setTamagochis: async (tamagochis: Tamagochi[]) => {
    storage.set(storageKeys.TAMAGOCHI_KEY, tamagochis);
  },

  addTamagochi: (tamagochi: Tamagochi) => {
    const tamagochis = tamagochiStorageService.getTamagochis();
    tamagochis.push(tamagochi);
    tamagochiStorageService.setTamagochis(tamagochis);
  },

  getTamagochiById: (id: string): Tamagochi | undefined => {
    try {
      const tamagochis = tamagochiStorageService.getTamagochis();
      return tamagochis.find((tamagochi) => tamagochi.id === id);
    } catch (error) {
      console.error("Erro ao buscar Tamagochi por ID: ", error);
      return undefined;
    }
  },
};

export default tamagochiStorageService;
