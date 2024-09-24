import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Animated, {
  withTiming,
  withSequence,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { router } from "expo-router";
import { colors } from "../constants/theme";
import * as ImagePicker from "expo-image-picker";
import { tamagochiService } from "@/services/tamagochi-service";

const RegisterTamagochiScreen = () => {
  const [name, setName] = useState<string>("");
  const [imageUri, setImageUri] = useState<string>("");

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const resetStates = useCallback(() => {
    setName("");
    setImageUri("");
  }, []);

  const buttonAnimated = () => {
    buttonScale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const handleCreateTamagochi = useCallback(async () => {
    try {
      buttonAnimated();
      await tamagochiService.createTamagochi(name, imageUri);
      resetStates();
      router.push("/");
    } catch (error) {
      console.error("Erro ao criar Tamagochi:", error);
    }
  }, [name, imageUri, buttonScale]);

  const handlePickImage = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão necessária",
        "Você precisa permitir o acesso à galeria."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tamagotchiFrame}>
        <View style={styles.screen}>
          <Text style={styles.label}>Crie um novo Tamagochi!</Text>
          <TextInput
            style={styles.input}
            placeholder="Qual o nome do seu novo tamagochi?"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#F7A025"
            maxLength={25}
          />
          <Pressable onPress={handlePickImage} style={styles.imageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  Insira uma foto do seu tamagochi
                </Text>
              </View>
            )}
          </Pressable>
        </View>
        <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
          <Pressable
            style={styles.button}
            onPress={handleCreateTamagochi}
            disabled={!name || !imageUri}
          >
            <Text style={styles.buttonText}>Crie meu Tamagochi</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  tamagotchiFrame: {
    flex: 1,
    margin: 16,
    padding: 16,
    borderWidth: 4,
    borderRadius: 12,
    borderColor: colors.purple,
    backgroundColor: colors.blue,
  },
  screen: {
    flex: 1,
    padding: 16,
    borderWidth: 4,
    marginBottom: 16,
    borderRadius: 12,
    borderColor: colors.purple,
    backgroundColor: colors.pink,
  },
  label: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.darkGray,
  },
  input: {
    fontSize: 16,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.darkGray,
    borderColor: colors.orange,
    backgroundColor: colors.gray,
  },
  imageContainer: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.orange,
    backgroundColor: colors.gray,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 16,
    textAlign: "center",
    color: colors.darkGray,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderColor: colors.purple,
    backgroundColor: colors.orange,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.darkGray,
  },
});

export default RegisterTamagochiScreen;
