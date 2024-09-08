import { Tamagochi, TamagochiStatus } from "@/types/tamagochi";

export const setTamagochiStatus = (status: number): TamagochiStatus => {
  if (status <= 0) return TamagochiStatus.DEAD;
  if (status <= 50) return TamagochiStatus.CRITICAL;
  if (status <= 100) return TamagochiStatus.VERY_SAD;
  if (status <= 150) return TamagochiStatus.SAD;
  if (status <= 200) return TamagochiStatus.OK;
  if (status <= 250) return TamagochiStatus.GOOD;
  if (status <= 300) return TamagochiStatus.VERY_GOOD;

  return TamagochiStatus.DEAD;
};

export const getStatusIcon = (status: TamagochiStatus) => {
  switch (status) {
    case TamagochiStatus.DEAD:
      return "skull";
    case TamagochiStatus.CRITICAL:
      return "alert";
    case TamagochiStatus.VERY_SAD:
      return "emoticon-sad";
    case TamagochiStatus.SAD:
      return "emoticon-sad-outline";
    case TamagochiStatus.OK:
      return "emoticon-neutral";
    case TamagochiStatus.GOOD:
      return "emoticon-happy";
    case TamagochiStatus.VERY_GOOD:
      return "emoticon-excited";
    default:
      return "emoticon-neutral";
  }
};

export const calculateTamagochiStatus = (
  fun: number,
  sleep: number,
  hunger: number
) => {
  const statusNumber = fun + sleep + hunger;
  return statusNumber;
};

export const convertToProgress = (value: number) => {
  return value / 100;
};
