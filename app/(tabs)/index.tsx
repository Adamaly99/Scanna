import React from 'react';
import { View, Text, StyleSheet, SectionList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, typography, radius, shadows } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocuments } from '@/hooks/useDocuments';
import { formatRelativeDate, formatBytes } from '@/utils/format';
import type { DocumentRecord } from '@/types';

export default function Home() {
  const { documents, loading } = useDocuments();
  const router = useRouter();
  const favorites = documents.filter((d) => d.isFavorite);
  const recent = documents.slice(0, 8);

  const sections = [
    { key: 'actions', data: [] as DocumentRecord[] },
    ...(favorites.length ? [{ key: 'favorites', data: favorites }] : []),
    { key: 'recent', data: recent },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.text }]}>Scana</Text>
        <Pressable onPress={() => router.push('/search')} accessibilityRole="button"
          accessibilityLabel="Rechercher" hitSlop={12} style={styles.searchBtn}>
          <Icon name="search" size={22} color={colors.text} />
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => {
          if (section.key === 'actions') return <ActionCards />;
          return (
            <Text style={[typography.h3, styles.sectionTitle]}>
              {section.key === 'favorites' ? 'Favoris' : 'Récents'}
            </Text>
          );
        }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40)}>
            <DocumentRow doc={item} onPress={() => router.push(`/document/${item.id}`)} />
          </Animated.View>
        )}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState icon="scan" title="Aucun document"
              message="Numérisez votre premier document en quelques secondes."
              actionLabel="Scanner" onAction={() => router.push('/scan')} />
          )
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/scan')}
        accessibilityRole="button" accessibilityLabel="Scanner un document">
        <Icon name="scan" size={26} color="#FFF" />
        <Text style={[typography.button, { color: '#FFF' }]}>Scanner</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function ActionCards() {
  const router = useRouter();
  const importImage = async () => {
    const ImagePicker = await import('expo-image-picker');
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (!res.canceled && res.assets[0]) {
      router.push({ pathname: '/scan', params: { importUri: res.assets[0].uri } });
    }
  };
  return (
    <View style={styles.actionsRow}>
      <ActionCard icon="plus" label="Nouveau scan" onPress={() => router.push('/scan')} primary />
      <ActionCard icon="import" label="Importer" onPress={() => void importImage()} />
    </View>
  );
}

function ActionCard({ icon, label, onPress, primary }: {
  icon: 'plus' | 'import'; label: string; onPress: () => void; primary?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.actionCard, primary && styles.actionCardPrimary]}
      accessibilityRole="button" accessibilityLabel={label}>
      <Icon name={icon} size={22} color={primary ? '#FFF' : colors.primary} />
      <Text style={[typography.bodySmall, { color: primary ? '#FFF' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function DocumentRow({ doc, onPress }: { doc: DocumentRecord; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="button"
      accessibilityLabel={`${doc.title}, ${doc.pageCount} pages`}>
      <View style={styles.thumb}><Icon name="page" size={22} color={colors.textTertiary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>{doc.title}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {doc.pageCount} page{doc.pageCount > 1 ? 's' : ''} · {formatBytes(doc.fileSize)} · {formatRelativeDate(doc.updatedAt)}
        </Text>
      </View>
      {doc.isProtected ? <Icon name="lock" size={16} color={colors.textTertiary} /> : null}
      <Icon name="chevronRight" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  searchBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 110, flexGrow: 1 },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  actionCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg,
  },
  actionCardPrimary: { backgroundColor: colors.primary },
  sectionTitle: { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.background, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  thumb: {
    width: 44, height: 56, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  fab: {
    position: 'absolute', bottom: spacing.xl, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    ...shadows.floating,
  },
});
