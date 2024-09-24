import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { Tamagochi } from "@/types/tamagochi";
import { convertToProgress, getStatusIcon } from "@/utils/tamagochi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { tamagochiService } from "@/services/tamagochi-service";

const EmptyTamagochiList = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>Você ainda não tem Tamagochis!</Text>
  </View>
);

const TamagochiListScreen = () => {
  const router = useRouter();
  const [tamagochiList, setTamagochiList] = useState<Tamagochi[]>(
    [] as Tamagochi[]
  );
  const [loading, setLoading] = useState(true);

  const renderItem = useCallback(
    ({ item }: { item: Tamagochi }) => {
      return (
        <Pressable
          style={styles.itemContainer}
          onPress={() => router.push(`./tamagochi-details?id=${item.id}`)}
        >
          <View style={styles.itemDetailsContainer}>
            <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <View style={styles.headerRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.iconView}>
                  <MaterialCommunityIcons
                    name={getStatusIcon(item.status)}
                    size={24}
                    color={colors.green}
                  />
                </View>
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
                          flex: convertToProgress(item.fun),
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
                          flex: convertToProgress(item.sleep),
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
                          flex: convertToProgress(item.hunger),
                          backgroundColor: colors.orange,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [router]
  );

  const fetchTamagochis = useCallback(async () => {
    try {
      setLoading(true);
      const tamagochis = await tamagochiService.getTamagochis();
      setTamagochiList(tamagochis);
    } catch (error) {
      console.error("Erro ao buscar Tamagochis: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAllTamagochis = useCallback(async () => {
    try {
      setLoading(true);
      await tamagochiService.deleteAllTamagochis();
      setTamagochiList([]);
    } catch (error) {
      console.error("Erro ao deletar todos os Tamagochis: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTamagochis();
  }, [fetchTamagochis]);

  useFocusEffect(
    useCallback(() => {
      fetchTamagochis();
    }, [fetchTamagochis])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.pink} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tamagochiList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyTamagochiList />}
      />
      <Pressable
        style={styles.button}
        onPress={() => router.push("/register-tamagochi")}
      >
        <Text style={styles.buttonText}>Criar Tamagochi!</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.blue,
  },
  itemRow: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
  },
  iconView: {
    flex: 0.2,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  list: {
    flexGrow: 1,
  },
  itemContainer: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
    borderRadius: 10,
    flexDirection: "row",
    borderColor: colors.pink,
    backgroundColor: colors.white,
  },
  itemDetailsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  itemImage: {
    width: 130,
    height: 130,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: colors.purple,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  itemName: {
    flex: 0.8,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
    color: colors.darkGray,
  },
  statusContainer: {
    marginTop: 8,
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
  button: {
    marginTop: 20,
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.purple,
    backgroundColor: colors.orange,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.darkGray,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.darkGray,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TamagochiListScreen;
