import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { searchService } from '@/search/searchService';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const results = useMemo(() => searchService.query(query), [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Retour">
          <Icon name="arrowLeft" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Input value={query} onChangeText={setQuery} placeholder="Titre, texte, tag, dossier…"
            autoFocus accessibilityLabel="Recherche" />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(r) => `${r.documentId}-${r.matchField}`}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable style={styles.result} onPress={() => router.push(`/document/${item.documentId}`)}
            accessibilityLabel={item.title}>
            <Icon name={item.matchField === 'title' ? 'page' : item.matchField === 'ocr' ? 'text'
              : item.matchField === 'tag' ? 'filter' : 'folder'}
              size={18} color={colors.textTertiary} />
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
              {item.snippet ? (
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.snippet}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          query.length >= 2
            ? <EmptyState icon="search" title="Aucun résultat"
                message={`Rien trouvé pour « ${query} ». L’OCR indexe les documents en arrière-plan.`} />
            : <EmptyState icon="search" title="Recherche locale"
                message="Recherchez dans les titres, le texte extrait (OCR), les tags et les dossiers." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  result: {
    flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start',
    backgroundColor: colors.background, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
});
