import { v4 as uuidv4 } from "uuid";
import { Tamagochi, TamagochiStatus } from "@/types/tamagochi";
import tamagochiStorageService from "@/storage/tamagochi-storage-service";

const getTamagochis = (): Tamagochi[] => {
  const tamagochis = tamagochiStorageService.getTamagochis();
  return refreshAllTamagochis(tamagochis);
};

const createTamagochi = (name: string, imageUri: string): Tamagochi => {
  const newTamagochi: Tamagochi = {
    id: uuidv4(),
    name,
    imageUri,
    fun: 70,
    sleep: 70,
    sleepStatus: {},
    hunger: 70,
    status: TamagochiStatus.VERY_GOOD,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  tamagochiStorageService.addTamagochi(newTamagochi);
  return newTamagochi;
};

const getTamagochi = (id: string): Tamagochi | undefined => {
  return tamagochiStorageService.getTamagochiById(id);
};

const updateTamagochi = (tamagochiToUpdate: Tamagochi): Tamagochi => {
  const tamagochis = tamagochiStorageService.getTamagochis();
  const index = tamagochis.findIndex(
    (tamagochi) => tamagochi.id === tamagochiToUpdate.id
  );

  if (index === -1) {
    throw new Error("Tamagochi não encontrado");
  }

  tamagochis[index] = {
    ...tamagochis[index],
    ...tamagochiToUpdate,
    updatedAt: new Date(),
  };

  tamagochiStorageService.setTamagochis(tamagochis);
  return tamagochis[index];
};

const refreshTamagochiStatus = (tamagochiId: string): Tamagochi | undefined => {
  const tamagochi = tamagochiStorageService.getTamagochiById(tamagochiId);

  if (!tamagochi) {
    return undefined;
  }

  const currentTime = new Date();
  const lastUpdateTime = new Date(tamagochi.updatedAt);
  const timeDifferenceInHours =
    (currentTime.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60);

  const hungerDecay = Math.min(timeDifferenceInHours * 1, tamagochi.hunger);
  const sleepDecay = Math.min(timeDifferenceInHours * 1, tamagochi.sleep);
  const funDecay = Math.min(timeDifferenceInHours * 1, tamagochi.fun);

  const updatedHunger = tamagochi.hunger - hungerDecay;
  const updatedSleep = tamagochi.sleep - sleepDecay;
  const updatedFun = tamagochi.fun - funDecay;

  const isDead = updatedHunger <= 0 && updatedSleep <= 0 && updatedFun <= 0;
  const newStatus = isDead ? TamagochiStatus.DEAD : tamagochi.status;

  const updatedTamagochiData: Tamagochi = {
    ...tamagochi,
    hunger: isDead ? 0 : updatedHunger,
    sleep: isDead ? 0 : updatedSleep,
    fun: isDead ? 0 : updatedFun,
    status: newStatus,
    updatedAt: currentTime,
  };

  tamagochiStorageService.setTamagochis(
    tamagochiStorageService
      .getTamagochis()
      .map((t) => (t.id === tamagochiId ? updatedTamagochiData : t))
  );

  return updatedTamagochiData;
};

const refreshAllTamagochis = (tamagochis: Tamagochi[]): Tamagochi[] => {
  return tamagochis
    .map((tamagochi) => refreshTamagochiStatus(tamagochi.id!))
    .filter((t): t is Tamagochi => t !== undefined);
};

const deleteTamagochi = (id: string): void => {
  const tamagochis = tamagochiStorageService.getTamagochis();
  const filteredTamagochis = tamagochis.filter((t) => t.id !== id);
  tamagochiStorageService.setTamagochis(filteredTamagochis);
};

const deleteAllTamagochis = (): void => {
  tamagochiStorageService.setTamagochis([]);
};

export const tamagochiService = {
  getTamagochi,
  getTamagochis,
  createTamagochi,
  updateTamagochi,
  deleteTamagochi,
  deleteAllTamagochis,
  refreshAllTamagochis,
  refreshTamagochiStatus,
};
