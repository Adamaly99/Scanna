import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocuments } from '@/hooks/useDocuments';
import { formatBytes, formatRelativeDate } from '@/utils/format';
import { useRouter } from 'expo-router';

type Sort = 'date_desc' | 'title' | 'size';

export default function Files() {
  const { documents, folders, createFolder, deleteFolder } = useDocuments();
  const [folderFilter, setFolderFilter] = useState<string | null | undefined>(undefined);
  const [sort, setSort] = useState<Sort>('date_desc');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const router = useRouter();

  const list = [...documents]
    .filter((d) => folderFilter === undefined || d.folderId === folderFilter)
    .sort((a, b) =>
      sort === 'title' ? a.title.localeCompare(b.title)
      : sort === 'size' ? b.fileSize - a.fileSize
      : b.updatedAt - a.updatedAt);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={[typography.h1, styles.title]}>Fichiers</Text>

      <FlatList
        horizontal
        data={folders}
        keyExtractor={(f) => f.id}
        style={styles.folders}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={
          <Pressable style={[styles.folderChip, folderFilter === undefined && styles.folderChipActive]}
            onPress={() => setFolderFilter(undefined)}>
            <Text style={styles.folderChipText}>Tous</Text>
          </Pressable>
        }
        ListFooterComponent={
          <Pressable style={styles.folderChip} onPress={() => setShowNewFolder(true)}>
            <Icon name="plus" size={14} color={colors.primary} />
            <Text style={[styles.folderChipText, { color: colors.primary }]}>Nouveau</Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable style={[styles.folderChip, folderFilter === item.id && styles.folderChipActive]}
            onPress={() => setFolderFilter(item.id)}
            onLongPress={() => deleteFolder(item.id)}
            accessibilityLabel={`Dossier ${item.name}, ${item.documentCount} documents`}>
            <Icon name="folder" size={14} color={item.color} />
            <Text style={styles.folderChipText}>{item.name} ({item.documentCount})</Text>
          </Pressable>
        )}
      />

      <View style={styles.sortRow}>
        {(['date_desc', 'title', 'size'] as Sort[]).map((s) => (
          <Pressable key={s} onPress={() => setSort(s)} hitSlop={8}>
            <Text style={[typography.caption, styles.sortText, sort === s && { color: colors.primary }]}>
              {s === 'date_desc' ? 'Récents' : s === 'title' ? 'Nom' : 'Taille'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={list}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/document/${item.id}`)}
            accessibilityLabel={item.title}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {item.pageCount} p. · {formatBytes(item.fileSize)} · {formatRelativeDate(item.updatedAt)}
                {item.tags.length ? ` · ${item.tags.join(', ')}` : ''}
              </Text>
            </View>
            <Icon name="chevronRight" size={18} color={colors.textTertiary} />
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState icon="folder" title="Aucun fichier"
            message="Les documents que vous scannez apparaissent ici." />
        }
      />

      <Modal visible={showNewFolder} title="Nouveau dossier"
        onClose={() => setShowNewFolder(false)} confirmLabel="Créer"
        onConfirm={() => {
          if (folderName.trim()) createFolder(folderName.trim());
          setFolderName(''); setShowNewFolder(false);
        }}>
        <Input label="Nom du dossier" value={folderName} onChangeText={setFolderName}
          placeholder="Ex : Factures" autoFocus />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  title: { color: colors.text, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  folders: { flexGrow: 0, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  folderChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.background, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm,
  },
  folderChipActive: { backgroundColor: colors.primarySoft },
  folderChipText: { ...typography.bodySmall, color: colors.text },
  sortRow: { flexDirection: 'row', gap: spacing.lg, paddingHorizontal: spacing.lg },
  sortText: { color: colors.textTertiary },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
});
