import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Dimensions, Animated } from "react-native";
import { Accelerometer } from "expo-sensors";

const { width, height } = Dimensions.get("window");

interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

const mazeWalls: Wall[] = [
  { x: 20, y: 20, width: width - 40, height: 10 }, // Parede superior
  { x: 20, y: 20, width: 10, height: height - 40 }, // Parede esquerda
  { x: width - 30, y: 20, width: 10, height: height - 40 }, // Parede direita
  { x: 20, y: height - 30, width: width - 40, height: 10 }, // Parede inferior
  { x: 60, y: 80, width: 200, height: 10 }, // Parede interna
  { x: 60, y: 150, width: 10, height: 150 }, // Parede interna vertical
  { x: 60, y: 250, width: 200, height: 10 }, // Parede interna horizontal
  { x: 260, y: 100, width: 10, height: 150 }, // Parede interna vertical direita
];

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

interface Position {
  x: number;
  y: number;
}

const colors = {
  red: "#ff0000",
  green: "#4CD534",
  orange: "#F7A025",
  pink: "#E41478",
  purple: "#27134C",
  blue: "#176B9A",
  darkGray: "#1A1122",
  softGray: "#e0e0e0",
  gray: "#f2f2f2",
  white: "#ffffff",
  disabled: "#828282",
};

export default function AnotherGame() {
  const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const [position, setPosition] = useState<Position>({
    x: width / 2 - 10, // Ajuste para o centro
    y: height / 2 - 10, // Ajuste para o centro
  });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);

  const ballSize = 12; // Dimensão da bola
  const destinationSize = 24; // Tamanho do ícone de destino (aumentado)

  // Posição do destino
  const destination: Position = { x: 150, y: 150 }; // Ajuste manual

  useEffect(() => {
    const subscription = Accelerometer.addListener(
      (accelerometerData: AccelerometerData) => {
        setData(accelerometerData);
      }
    );

    Accelerometer.setUpdateInterval(16); // Aproximadamente 60 fps

    return () => subscription && subscription.remove();
  }, []);

  useEffect(() => {
    if (!isGameOver && !isGameWon) {
      const newX = position.x - data.x * 5;
      const newY = position.y + data.y * 5;

      // Verificar se a bola colidiu com alguma parede
      const collision = mazeWalls.some(
        (wall) =>
          newX < wall.x + wall.width &&
          newX + ballSize > wall.x &&
          newY < wall.y + wall.height &&
          newY + ballSize > wall.y
      );

      if (collision) {
        setIsGameOver(true);
      } else {
        setPosition({ x: newX, y: newY });
      }

      // Verificar se a bola chegou ao destino
      if (
        newX >= destination.x &&
        newX <= destination.x + destinationSize &&
        newY >= destination.y &&
        newY <= destination.y + destinationSize
      ) {
        setIsGameWon(true);
      }
    }
  }, [data]);

  const resetGame = () => {
    setPosition({
      x: width / 2 - 10, // Posição central inicial
      y: height / 2 - 10,
    });
    setIsGameOver(false);
    setIsGameWon(false);
  };

  return (
    <View style={styles.container}>
      {isGameWon ? (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>Você Venceu!</Text>
          <Text onPress={resetGame} style={styles.restartButton}>
            Jogar Novamente
          </Text>
        </View>
      ) : isGameOver ? (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text onPress={resetGame} style={styles.restartButton}>
            Tentar Novamente
          </Text>
        </View>
      ) : (
        <>
          {mazeWalls.map((wall, index) => (
            <View
              key={index}
              style={[
                styles.wall,
                {
                  left: wall.x,
                  top: wall.y,
                  width: wall.width,
                  height: wall.height,
                },
              ]}
            />
          ))}

          {/* destino */}
          <View
            style={[
              styles.destination,
              {
                left: destination.x,
                top: destination.y,
                width: destinationSize,
                height: destinationSize,
              },
            ]}
          >
            <Text style={styles.destinationText}>X</Text>
          </View>

          <Animated.View
            style={[
              styles.ball,
              {
                left: position.x,
                top: position.y,
                width: ballSize,
                height: ballSize,
                borderRadius: ballSize / 2,
              },
            ]}
          />
          <Text style={styles.instructions}>Guie a bola até o "X"!</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.blue, // Fundo azul
  },
  ball: {
    backgroundColor: colors.green, // Bola verde
    position: "absolute",
  },
  wall: {
    position: "absolute",
    backgroundColor: colors.softGray, // Paredes cinza claro
  },
  destination: {
    position: "absolute",
    backgroundColor: colors.red, // Fundo do destino vermelho
    justifyContent: "center",
    alignItems: "center",
  },
  destinationText: {
    color: colors.white, // Texto "X" branco
    fontWeight: "bold",
    fontSize: 24, // Aumenta o tamanho do "X"
  },
  instructions: {
    position: "absolute",
    bottom: 40,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white, // Instruções em branco
  },
  gameOverContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.red, // Texto de Game Over vermelho
  },
  restartButton: {
    fontSize: 20,
    color: colors.orange, // Botão de reiniciar em laranja
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
