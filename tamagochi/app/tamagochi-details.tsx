import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Tamagochi, TamagochiStatus } from "@/types/tamagochi";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getStatusIcon,
  setTamagochiStatus,
  convertToProgress,
  calculateTamagochiStatus,
} from "@/utils/tamagochi";
import { colors } from "@/constants/theme";
import { tamagochiService } from "@/services/tamagochi-service";

const foodIconList: Array<
  React.ComponentProps<typeof MaterialCommunityIcons>["name"]
> = [
  "ice-cream",
  "food-drumstick-outline",
  "fruit-watermelon",
  "pizza",
  "water-outline",
  "food-apple-outline",
];

const TamagochiDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [tamagochi, setTamagochi] = useState<Tamagochi | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepTimeLeft, setSleepTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const disabled = isSleeping || tamagochi?.status === TamagochiStatus.DEAD;

  const handleTamagochiWokeUp = useCallback(async () => {
    try {
      setIsSleeping(false);
      setSleepTimeLeft(0);

      const fetchedTamagochi = await tamagochiService.getTamagochi(
        id as string
      );
      if (!fetchedTamagochi) return;

      const updatedSleep = Math.min(fetchedTamagochi.sleep + 10, 100);
      const currentStatus = calculateTamagochiStatus(
        fetchedTamagochi.fun,
        updatedSleep,
        fetchedTamagochi.hunger
      );
      const updatedStatus = setTamagochiStatus(currentStatus);

      const updatedTamagochi: Tamagochi = {
        ...fetchedTamagochi,
        sleepStatus: {},
        sleep: updatedSleep,
        status: updatedStatus,
      };

      const currentTamagochi = await tamagochiService.updateTamagochi(
        updatedTamagochi
      );
      setTamagochi(currentTamagochi);
    } catch (error) {
      console.error("Erro ao acordar Tamagochi: ", error);
    }
  }, [id]);

  const startSleepTimer = useCallback(
    (duration: number) => {
      setIsSleeping(true);
      setSleepTimeLeft(duration);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setSleepTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            handleTamagochiWokeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    },
    [handleTamagochiWokeUp]
  );

  const fetchTamagochi = useCallback(async () => {
    try {
      if (!id) return;
      const fetchedTamagochi = await tamagochiService.getTamagochi(
        id as string
      );
      if (!fetchedTamagochi) return;

      const { fun, sleep, hunger, sleepStatus } = fetchedTamagochi;
      const currentStatus = calculateTamagochiStatus(fun, sleep, hunger);
      const updatedStatus = setTamagochiStatus(currentStatus);
      setTamagochi({ ...fetchedTamagochi, status: updatedStatus });

      if (sleepStatus?.sleepEndTime) {
        const sleepEndTime = new Date(sleepStatus.sleepEndTime);
        const currentTime = Date.now();
        const timeLeft = Math.max(
          0,
          Math.floor((sleepEndTime.getTime() - currentTime) / 1000)
        );

        if (timeLeft > 0) {
          startSleepTimer(timeLeft);
        } else {
          handleTamagochiWokeUp();
        }
      }
    } catch (error) {
      console.error("Erro ao buscar Tamagochi: ", error);
    }
  }, [id, startSleepTimer, handleTamagochiWokeUp]);

  useEffect(() => {
    fetchTamagochi();
  }, [fetchTamagochi]);

  useFocusEffect(
    useCallback(() => {
      fetchTamagochi();

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [fetchTamagochi])
  );

  const handleFoodIconPress = useCallback(async () => {
    try {
      if (!tamagochi) return;

      const updatedHunger = Math.min(tamagochi.hunger + 1, 100);

      const currentStatus = calculateTamagochiStatus(
        tamagochi.fun,
        tamagochi.sleep,
        updatedHunger
      );

      const updatedStatus = setTamagochiStatus(currentStatus);

      const updatedTamagochi = {
        ...tamagochi,
        hunger: updatedHunger,
        status: updatedStatus,
      };
      const currentTamagochi = await tamagochiService.updateTamagochi(
        updatedTamagochi
      );

      setTamagochi(currentTamagochi);
    } catch (error) {
      console.error("Erro ao atualizar Tamagochi food:", error);
    }
  }, [tamagochi]);

  const handleSleepIconPress = useCallback(async () => {
    if (!tamagochi) return;

    const sleepStartTime = new Date();
    const sleepDurationMinutes = 0.2;
    const sleepDuration = sleepDurationMinutes * 60 * 1000;
    const sleepEndTime = new Date(sleepStartTime.getTime() + sleepDuration);

    const updatedTamagochi: Tamagochi = {
      ...tamagochi,
      sleepStatus: {
        sleepStartTime,
        sleepDuration,
        sleepEndTime,
      },
    };

    await tamagochiService.updateTamagochi(updatedTamagochi);
    startSleepTimer(sleepDuration / 1000);
  }, [tamagochi, startSleepTimer]);

  const handleMemoryGameIconPress = useCallback(() => {
    router.push(`./memory-game?id=${id}`);
  }, [id]);

  const handleRockPaperScissorIconPress = useCallback(() => {
    router.push(`./rock-paper-scissor-game?id=${id}`);
  }, [id]);

  const handleAnotherGameIconPress = useCallback(() => {
    router.push(`./another-game?id=${id}`);
  }, [id]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  if (!tamagochi) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.tamagotchiFrame}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: tamagochi.imageUri }} style={styles.image} />

            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {tamagochi.name}
            </Text>

            <View style={styles.row}>
              <MaterialCommunityIcons
                name={getStatusIcon(tamagochi.status)}
                size={24}
                color={colors.green}
              />
              <Text style={styles.detailText}>{tamagochi.status}</Text>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <MaterialCommunityIcons
                  name="toy-brick"
                  size={24}
                  color={colors.pink}
                />
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progress,
                      {
                        flex: convertToProgress(tamagochi.fun ?? 0),
                        backgroundColor: colors.pink,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statusRow}>
                <MaterialCommunityIcons
                  name="bed"
                  size={24}
                  color={colors.blue}
                  disabled={disabled}
                />
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progress,
                      {
                        flex: convertToProgress(tamagochi.sleep ?? 0),
                        backgroundColor: colors.blue,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.statusRow}>
                <MaterialCommunityIcons
                  name="food"
                  size={24}
                  color={colors.orange}
                />
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progress,
                      {
                        flex: convertToProgress(tamagochi.hunger ?? 0),
                        backgroundColor: colors.orange,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
            <Pressable
              onPress={handleSleepIconPress}
              style={styles.iconContainer}
              disabled={disabled}
            >
              <MaterialCommunityIcons
                name="sleep"
                size={24}
                color={disabled ? colors.blue : colors.blue}
              />
              {isSleeping ? (
                <Text style={styles.detailText}>
                  Acorda em: {formatTime(sleepTimeLeft)}
                </Text>
              ) : null}
            </Pressable>
            <View style={styles.iconRow}>
              {foodIconList.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={handleFoodIconPress}
                  style={styles.iconContainer}
                  disabled={disabled}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={24}
                    color={disabled ? colors.disabled : colors.blue}
                  />
                </Pressable>
              ))}
            </View>
            <View style={styles.gamesContainer}>
              <Pressable
                onPress={handleMemoryGameIconPress}
                style={styles.gameButton}
                disabled={disabled}
              >
                <MaterialCommunityIcons
                  name="gamepad-variant"
                  size={24}
                  color={disabled ? colors.disabled : colors.blue}
                  disabled={disabled}
                />
                <Text
                  style={[
                    styles.iconText,
                    { color: disabled ? colors.disabled : colors.blue },
                  ]}
                >
                  Jogo da Memória
                </Text>
              </Pressable>
              
              <Pressable
                onPress={handleRockPaperScissorIconPress}
                style={styles.gameButton}
                disabled={disabled}
              >
                <MaterialCommunityIcons
                  name="gamepad-variant"
                  size={24}
                  color={disabled ? colors.disabled : colors.blue}
                  disabled={disabled}
                />
                <Text
                  style={[
                    styles.iconText,
                    { color: disabled ? colors.disabled : colors.blue },
                  ]}
                >
                  Pedra, Papel, Tesoura
                </Text>
              </Pressable>
              
              <Pressable
                onPress={handleAnotherGameIconPress}
                style={styles.gameButton}
                disabled={disabled}
              >
                <MaterialCommunityIcons
                  name="gamepad-variant"
                  size={24}
                  color={disabled ? colors.disabled : colors.blue}
                  disabled={disabled}
                />
                <Text
                  style={[
                    styles.iconText,
                    { color: disabled ? colors.disabled : colors.blue },
                  ]}
                >
                  Labirinto das Dimensões
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/confirm-delete",
              params: { id: tamagochi.id, tamagochiName: tamagochi.name },
            })
          }
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons
            name="delete"
            size={24}
            color={colors.white}
          />
          <Text style={styles.deleteButtonText}>Apagar Tamagotchi</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "cover",
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: "center",
    borderColor: colors.purple,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    flexShrink: 1,
    marginBottom: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.darkGray,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusContainer: {
    marginTop: 16,
    width: "100%",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: colors.softGray,
    borderRadius: 5,
    marginHorizontal: 8,
    flexDirection: "row",
  },
  progress: {
    height: "100%",
    borderRadius: 5,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 10,
    fontWeight: "bold",
    color: colors.blue,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.darkGray,
    textAlign: "center",
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    margin: 2,
    flexDirection: "row",
    backgroundColor: colors.softGray,
    borderRadius: 8,
  },
  sleepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconText: {
    color: colors.green,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "bold",
  },
  gameContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    margin: 2,
    flexDirection: "row",
    backgroundColor: colors.softGray,
    borderRadius: 8,
  },
  floatingButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
  },
  gamesContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  gameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  tamagotchiFrame: {
    flex: 1,
    padding: 16,
    borderWidth: 4,
    borderRadius: 12,
    marginBottom: 16,
    borderColor: colors.purple,
    backgroundColor: colors.blue,
  },
  imageContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    alignItems: "center",
    borderColor: colors.orange,
    backgroundColor: colors.white,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.softGray,
  },
  deleteButton: {
    backgroundColor: colors.red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: colors.white,
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default TamagochiDetailsScreen;
