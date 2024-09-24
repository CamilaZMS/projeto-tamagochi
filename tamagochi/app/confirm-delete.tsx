import React, { useCallback } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { colors } from "@/constants/theme";
import { tamagochiService } from "@/services/tamagochi-service";
import { useLocalSearchParams, useRouter } from "expo-router";

const ConfirmDeleteScreen = () => {
  const router = useRouter();
  const { id, tamagochiName } = useLocalSearchParams();

  const handleDeleteConfirm = useCallback(async () => {
    try {
      if (!id) return;
      await tamagochiService.deleteTamagochi(id as string);
      router.replace("/");
    } catch (error) {
      console.error("Erro ao deletar o Tamagochi: ", error);
    }
  }, [id, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Tem certeza que deseja matar o Tamagochi "{tamagochiName}"?
      </Text>
      <Text style={styles.text}>
        você será considerado um assassino de Tamagochis.
      </Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteConfirm}
        >
          <Text style={styles.buttonText}>Deletar</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.blue,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.darkGray,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    width: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.gray,
  },
  deleteButton: {
    backgroundColor: colors.red,
  },
  buttonText: {
    color: colors.darkGray,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ConfirmDeleteScreen;
