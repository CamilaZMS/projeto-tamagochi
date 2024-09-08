import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Tamagochi } from "@/types/tamagochi";
import { useLocalSearchParams } from "expo-router";
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
  const [tamagochi, setTamagochi] = useState<Tamagochi | undefined>(undefined);

  const fetchTamagochi = useCallback(() => {
    try {
      if (!id) return;
      const fetchedTamagochi = tamagochiService.getTamagochi(id as string);
      if (!fetchedTamagochi) return;

      const { fun, sleep, hunger } = fetchedTamagochi;
      const statusNumber = calculateTamagochiStatus(fun, sleep, hunger);
      const updatedStatus = setTamagochiStatus(statusNumber);
      setTamagochi({ ...fetchedTamagochi, status: updatedStatus });
    } catch (error) {
      console.error("Erro ao buscar Tamagochi: ", error);
    }
  }, [id]);

  useEffect(() => {
    fetchTamagochi();
  }, [fetchTamagochi]);

  const handleFoodIconPress = useCallback(() => {
    try {
      if (!tamagochi) return;

      const updatedHunger = Math.min(tamagochi.hunger + 1, 100);

      const updatedStatus = setTamagochiStatus(
        calculateTamagochiStatus(tamagochi.fun, tamagochi.sleep, updatedHunger)
      );

      const updatedTamagochi = {
        ...tamagochi,
        hunger: updatedHunger,
        status: updatedStatus,
      };
      const currentTamagochi =
        tamagochiService.updateTamagochi(updatedTamagochi);

      setTamagochi(currentTamagochi);
    } catch (error) {
      console.error("Erro ao atualizar Tamagochi:", error);
    }
  }, [tamagochi]);

  if (!tamagochi) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
                      flex: convertToProgress(tamagochi.fun),
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
              />
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progress,
                    {
                      flex: convertToProgress(tamagochi.sleep),
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
                      flex: convertToProgress(tamagochi.hunger),
                      backgroundColor: colors.orange,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.iconRow}>
            {foodIconList.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => handleFoodIconPress()}
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons
                  name={icon}
                  size={24}
                  color={colors.darkGray}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    alignItems: "center",
    borderColor: colors.orange,
    backgroundColor: colors.white,
  },
  image: {
    width: 150,
    height: 150,
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
    color: colors.pink,
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
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
    color: colors.darkGray,
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

    borderColor: colors.purple,
    backgroundColor: colors.softGray,
    borderRadius: 8,
  },
});

export default TamagochiDetailsScreen;
