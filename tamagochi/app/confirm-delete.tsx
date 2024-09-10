import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { tamagochiService } from '@/services/tamagochi-service';
import { colors } from '@/constants/theme';

const ConfirmDeleteScreen = () => {
  const { id, tamagochiName } = useLocalSearchParams();
  const router = useRouter();

  const handleDeleteConfirm = useCallback(() => {
    try {
      if (!id) return;
      tamagochiService.deleteTamagochi(id as string);
      router.replace('/');
    } catch (error) {
      console.error('Erro ao deletar o Tamagochi: ', error);
    }
  }, [id, router]);

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Tem certeza que deseja matar o Tamagochi "{tamagochiName}"?
        <br></br>
        a ação é irreversível e você será considerado um assassino de Tamagochis.
      </Text>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDeleteConfirm}>
          <Text style={styles.buttonText}>Deletar</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.darkGray,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    width: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray,
  },
  deleteButton: {
    backgroundColor: colors.red,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConfirmDeleteScreen;
