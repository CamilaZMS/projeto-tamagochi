export enum TamagochiStatus {
  DEAD = "Morto",
  CRITICAL = "Crítico",
  VERY_SAD = "Muito triste",
  SAD = "Triste",
  OK = "Ok",
  GOOD = "Bem",
  VERY_GOOD = "Muito bem",
}

export type Tamagochi = {
  id?: string;
  name: string;
  imageUri: string;
  fun: number;
  sleep: number;
  hunger: number;
  status: TamagochiStatus;
  updatedAt: Date;
  createdAt: Date;
};
