import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Button, Loader } from '@/components/atoms';
import { useDocuments } from '@/hooks/useDocuments';
import { colors, spacing } from '@/constants/theme';

export default function DocumentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getDocument, deleteDocument } = useDocuments();
  const document = getDocument(id as string);

  if (!document) {
    return <Loader />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {document.title}
        </Text>

        <View style={styles.info}>
          <Text variant="body">
            <Text variant="button">Pages:</Text> {document.pageCount}
          </Text>
          <Text variant="body">
            <Text variant="button">Créé:</Text>{' '}
            {new Date(document.createdAt).toLocaleDateString()}
          </Text>
          <Text variant="body">
            <Text variant="button">Modifié:</Text>{' '}
            {new Date(document.modifiedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Éditer"
            onPress={() => {}}
            style={styles.button}
          />
          <Button
            label="Exporter"
            variant="secondary"
            onPress={() => {}}
            style={styles.button}
          />
          <Button
            label="Supprimer"
            variant="outlined"
            onPress={async () => {
              await deleteDocument(document.id);
              router.back();
            }}
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals[50],
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
  },
  info: {
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
  button: {
    marginBottom: spacing.md,
  },
});