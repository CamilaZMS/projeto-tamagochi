import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Meus tamagochis",
          headerLeft: () => null,
        }}
      />
      <Stack.Screen name="register-tamagochi" options={{ title: "Voltar" }} />
      <Stack.Screen
        name="tamagochi-details"
        options={{
          title: "Detalhes",
        }}
      />
      <Stack.Screen
        name="memory-game"
        options={{
          title: "Voltar",
        }}
      />
      <Stack.Screen
        name="rock-paper-scissor-game"
        options={{
          title: "Voltar",
        }}
      />
    </Stack>
    
  );
}
