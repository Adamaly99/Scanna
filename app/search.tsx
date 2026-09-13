import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Text, Card } from '@/components/atoms';
import { useDocuments } from '@/hooks/useDocuments';
import { colors, spacing } from '@/constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const { documents } = useDocuments();
  const [searchText, setSearchText] = useState('');

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Rechercher des documents..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {searchText.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="body" color={colors.neutrals[500]}>
            Entrez un terme de recherche
          </Text>
        </View>
      ) : filteredDocuments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="body" color={colors.neutrals[500]}>
            Aucun résultat trouvé
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              style={styles.resultCard}
              onPress={() => router.push(`/document/${item.id}`)}
            >
              <Text variant="h3" numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="caption" color={colors.neutrals[500]}>
                {item.pageCount} pages
              </Text>
            </Card>
          )}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals[50],
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals[200],
  },
  resultsList: {
    padding: spacing.lg,
  },
  resultCard: {
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});