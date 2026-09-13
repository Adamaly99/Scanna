import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, Card, Loader } from '@/components/atoms';
import { useDocuments } from '@/hooks/useDocuments';
import { colors, spacing } from '@/constants/theme';

export default function FilesScreen() {
  const router = useRouter();
  const { documents, isLoading, refresh, deleteDocument } = useDocuments();

  useEffect(() => {
    refresh();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (documents.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="h2" style={styles.emptyTitle}>
            Aucun document
          </Text>
          <Text variant="body" color={colors.neutrals[600]} style={styles.emptySubtitle}>
            Commencez par numériser un document
          </Text>
          <Button
            label="Nouveau scan"
            onPress={() => router.push('/scan')}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.documentCard}
            onPress={() => router.push(`/document/${item.id}`)}
          >
            <View style={styles.documentContent}>
              <View style={styles.documentInfo}>
                <Text variant="h3" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text
                  variant="caption"
                  color={colors.neutrals[500]}
                  numberOfLines={1}
                >
                  {item.pageCount} page{item.pageCount > 1 ? 's' : ''} •{' '}
                  {new Date(item.modifiedAt).toLocaleDateString()}
                </Text>
              </View>
              <Button
                label="Supprimer"
                variant="ghost"
                size="sm"
                onPress={() => deleteDocument(item.id)}
              />
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals[50],
  },
  listContent: {
    padding: spacing.lg,
  },
  documentCard: {
    marginBottom: spacing.md,
  },
  documentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
});