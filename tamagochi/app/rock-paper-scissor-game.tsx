import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { Tamagochi } from "@/types/tamagochi";
import { tamagochiService } from "@/services/tamagochi-service";
import { router, useLocalSearchParams } from "expo-router";
import {
  setTamagochiStatus,
  calculateTamagochiStatus,
} from "@/utils/tamagochi";

const choices = [
  { name: "Pedra", icon: "hand-rock-o" },
  { name: "Papel", icon: "hand-paper-o" },
  { name: "Tesoura", icon: "hand-scissors-o" },
];

const getGameResult = (playerChoice: string, tamagochiChoice: string) => {
  if (playerChoice === tamagochiChoice) return "Empate!";
  if (
    (playerChoice === "Pedra" && tamagochiChoice === "Tesoura") ||
    (playerChoice === "Tesoura" && tamagochiChoice === "Papel") ||
    (playerChoice === "Papel" && tamagochiChoice === "Pedra")
  ) {
    return "Você venceu!";
  }
  return "Tamagotchi venceu!";
};

const RockPaperScissors = () => {
  const { id } = useLocalSearchParams();
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [tamagotchiChoice, setTamagochiChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [tamagochi, setTamagochi] = useState<Tamagochi | undefined>(undefined);

  const handleGameFinished = useCallback(() => {
    try {
      if (!tamagochi) return;

      const updatedFun = Math.min(tamagochi.fun + 20, 100);

      const currentStatus = calculateTamagochiStatus(
        updatedFun,
        tamagochi.sleep,
        tamagochi.hunger
      );

      const updatedStatus = setTamagochiStatus(currentStatus);

      const updatedTamagochi = {
        ...tamagochi,
        fun: updatedFun,
        status: updatedStatus,
      };

      tamagochiService.updateTamagochi(updatedTamagochi);

      router.back();
    } catch (error) {
      console.error("Erro ao atualizar Tamagochi fun:", error);
    }
  }, [tamagochi]);

  const handlePlayerChoice = useCallback((choice: string) => {
    setPlayerChoice(choice);

    const randomChoice = choices[Math.floor(Math.random() * choices.length)].name;
    setTamagochiChoice(randomChoice);

    const gameResult = getGameResult(choice, randomChoice);
    setResult(gameResult);
  }, []);

  const fetchTamagochi = useCallback(() => {
    try {
      const fetchedTamagochi = tamagochiService.getTamagochi(id as string);
      setTamagochi(fetchedTamagochi);
    } catch (error) {
      console.error("Erro ao buscar Tamagochi: ", error);
    }
  }, [id]);

  useEffect(() => {
    fetchTamagochi();
  }, [fetchTamagochi]);

  useEffect(() => {
    if (result) {
      setTimeout(() => {
        handleGameFinished();
      }, 2000);
    }
  }, [result, handleGameFinished]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedra, Papel, Tesoura</Text>

      <View style={styles.choicesContainer}>
        {choices.map((choice) => (
          <Pressable
            key={choice.name}
            style={styles.choiceButton}
            onPress={() => handlePlayerChoice(choice.name)}
          >
            <FontAwesome name={choice.icon as keyof typeof FontAwesome.glyphMap} size={50} color={colors.white} />
            <Text style={styles.choiceText}>{choice.name}</Text>
          </Pressable>
        ))}
      </View>

      {playerChoice && tamagotchiChoice && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Você escolheu: {playerChoice}
          </Text>
          <Text style={styles.resultText}>
            Tamagotchi escolheu: {tamagotchiChoice}
          </Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.darkGray,
  },
  choicesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  choiceButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green,
    borderRadius: 10,
    padding: 20,
  },
  choiceText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 10,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    color: colors.darkGray,
    marginVertical: 5,
  },
});

export default RockPaperScissors;
