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

type Card = {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
};

const icons = ["heart", "star", "diamond", "bolt"];

const createDeck = (): Card[] => {
  const deck = icons.flatMap((icon, index) => [
    { id: index * 2, icon, flipped: false, matched: false },
    { id: index * 2 + 1, icon, flipped: false, matched: false },
  ]);
  return shuffle(deck);
};

const shuffle = (array: Card[]): Card[] => {
  return array.sort(() => Math.random() - 0.5);
};

const MemoryGame = () => {
  const { id } = useLocalSearchParams();
  const [cards, setCards] = useState<Card[]>(createDeck());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [tamagochi, setTamagochi] = useState<Tamagochi | undefined>(undefined);

  const handleGameFinished = useCallback(() => {
    try {
      if (!tamagochi) return;

      const updatedFun = Math.min(tamagochi.fun + 30, 100);

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

  const handleCardFlip = useCallback(
    (first: number, second: number) => {
      if (cards[first].icon === cards[second].icon) {
        setCards((prevCards) =>
          prevCards.map((card, index) =>
            index === first || index === second
              ? { ...card, matched: true }
              : card
          )
        );
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card, index) =>
              index === first || index === second
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    },
    [cards]
  );

  const fetchTamagochi = useCallback(() => {
    try {
      const fetchedTamagochi = tamagochiService.getTamagochi(id as string);
      setTamagochi(fetchedTamagochi);
    } catch (error) {
      console.error("Erro ao buscar Tamagochi: ", error);
    }
  }, [id]);

  const handleCardPress = useCallback(
    (index: number) => {
      if (
        flippedCards.length < 2 &&
        !cards[index].flipped &&
        !cards[index].matched
      ) {
        setCards((prevCards) =>
          prevCards.map((card, i) =>
            i === index ? { ...card, flipped: true } : card
          )
        );
        setFlippedCards((prevFlipped) => [...prevFlipped, index]);
      }
    },
    [flippedCards, cards]
  );

  const handleResetGame = useCallback(() => {
    setCards(createDeck());
    setFlippedCards([]);
  }, []);

  useEffect(() => {
    fetchTamagochi();
  }, [fetchTamagochi]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      handleCardFlip(first, second);
    }
  }, [flippedCards, handleCardFlip]);

  useEffect(() => {
    if (cards.every((card) => card.matched)) {
      handleGameFinished();
    }
  }, [cards, handleGameFinished]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogo da Memória</Text>
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <Pressable
            key={card.id}
            style={[
              styles.card,
              card.flipped || card.matched ? styles.cardFlipped : {},
            ]}
            onPress={() => handleCardPress(index)}
            disabled={card.flipped || card.matched}
          >
            {(card.flipped || card.matched) && (
              <FontAwesome
                name={card.icon as any}
                size={40}
                color={colors.white}
              />
            )}
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.resetButton} onPress={handleResetGame}>
        <Text style={styles.resetButtonText}>Reiniciar Jogo</Text>
      </Pressable>
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
  grid: {
    maxWidth: 300,
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 65,
    height: 65,
    backgroundColor: colors.green,
    margin: 5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardFlipped: {
    backgroundColor: colors.green,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: colors.pink,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default MemoryGame;
