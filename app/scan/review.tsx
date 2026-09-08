import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ReviewStrip } from '@/components/scanner/ReviewStrip';
import { QuadEditor } from '@/components/scanner/QuadEditor';
import { useScanStore, scanPageToRecord } from '@/stores/scanStore';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useToast } from '@/components/ui/Toast';
import { warpPerspective } from '@/image-processing/skiaWarp';
import { normalizedToPixelQuad } from '@/scanner/quadDetection';
import { applyFilter } from '@/image-processing/filters';
import * as fileStorage from '@/storage/fileStorage';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function ReviewScreen() {
  const { pages, activeIndex, setActiveIndex, removePage, movePage, updatePage, reset } = useScanStore();
  const createDocument = useDocumentsStore((s) => s.createDocument);
  const [saving, setSaving] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [title, setTitle] = useState(`Scan ${new Date().toLocaleDateString('fr-FR')}`);
  const [editingQuad, setEditingQuad] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const page = pages[activeIndex];

  const save = async () => {
    if (pages.length === 0) return;
    setSaving(true);
    try {
      const doc = createDocument({
        title: title.trim() || 'Document',
        folderId: null,
        tags: [],
        source: 'camera',
        pages: pages.map((p, i) => scanPageToRecord(p, 'pending-doc-id', i)),
      });
      // Corrige le documentId injecté à la création (le repository a généré un id propre)
      const realDoc = useDocumentsStore.getState().documents.find(
        (d) => d.title === (title.trim() || 'Document'),
      );
      const target = realDoc ?? doc;

      // Traitement par page : warp perspective si quad, puis filtre
      for (const [i, p] of pages.entries()) {
        const record = scanPageToRecord(p, target.id, i);
        let working = p.tempUri;
        if (p.quad) {
          const quadPx = normalizedToPixelQuad(p.quad, p.width, p.height || Math.round(p.width * 1.4));
          const out = fileStorage.processedImagePath(target.id, p.id);
          const warped = await warpPerspective({
            sourceUri: p.tempUri, quad: quadPx,
            outWidth: 1240, outHeight: 1754, quality: 0.85, outPath: out,
          });
          if (warped.ok) working = warped.value.uri;
        }
        const filtered = await applyFilter({
          sourceUri: working, filter: p.filter, adjustments: p.adjustments,
          quality: 0.85,
          outPath: fileStorage.processedImagePath(target.id, p.id),
        });
        record.imagePath = p.tempUri;
        record.processedPath = filtered.ok ? filtered.value.uri : working;
        const { documentRepository } = await import('@/database/documentRepository');
        documentRepository.addPage(target.id, record);
        // Réécriture du chemin image correct dans le record persisté
        const persisted = documentRepository.getPage(record.id);
        if (persisted) {
          persisted.imagePath = p.tempUri.replace('/temp/', `/${target.id}/`);
          const moved = await fileStorage.copyInto(p.tempUri, persisted.imagePath);
          if (moved.ok) { await fileStorage.deleteFile(p.tempUri); }
          documentRepository.updatePage(persisted);
        }
      }
      reset();
      setSaveModal(false);
      toast('Document enregistré', 'success');
      router.replace(`/document/${target.id}`);
    } catch (e) {
      Alert.alert('Erreur', 'Enregistrement impossible. Vos pages sont conservées.');
    } finally {
      setSaving(false);
    }
  };

  if (!page) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Aucune page.</Text>
        <Button label="Retour à la caméra" onPress={() => router.replace('/scan')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Retour">
          <Icon name="arrowLeft" size={24} color={colors.text} />
        </Pressable>
        <Text style={[typography.h3, { color: colors.text }]}>Réviser le scan</Text>
        <Pressable onPress={() => setEditingQuad((v) => !v)} hitSlop={12}
          accessibilityLabel="Ajuster les coins du document">
          <Icon name="crop" size={22} color={editingQuad ? colors.primary : colors.text} />
        </Pressable>
      </View>

      <View style={styles.preview}>
        <Image source={{ uri: page.tempUri }} style={{ width: width - spacing.xl * 2, height: (width - spacing.xl * 2) * 1.35 }}
          contentFit="contain" recyclingKey={page.id} />
        {editingQuad && page.quad ? (
          <QuadEditor quad={page.quad} width={width - spacing.xl * 2}
            height={(width - spacing.xl * 2) * 1.35}
            onChange={(q) => updatePage(page.id, { quad: q })} />
        ) : null}
      </View>

      <View style={styles.filtersRow}>
        {(['original', 'document', 'grayscale', 'blackwhite'] as const).map((f) => (
          <Pressable key={f} onPress={() => updatePage(page.id, { filter: f })}
            style={[styles.filterChip, page.filter === f && styles.filterChipActive]}
            accessibilityLabel={`Filtre ${f}`} accessibilityState={{ selected: page.filter === f }}>
            <Text style={[typography.caption, { color: page.filter === f ? '#FFF' : colors.text }]}>
              {{ original: 'Couleur', document: 'Document', grayscale: 'Gris', blackwhite: 'N&B' }[f]}
            </Text>
          </Pressable>
        ))}
      </View>

      <ReviewStrip pages={pages} activeIndex={activeIndex} onSelect={setActiveIndex}
        onRemove={removePage} onMove={movePage} />

      <View style={styles.footer}>
        <Button label="Ajouter une page" variant="secondary" icon="plus"
          onPress={() => router.push('/scan')} />
        <Button label={`Enregistrer (${pages.length})`} onPress={() => setSaveModal(true)}
          loading={saving} />
      </View>

      <Modal visible={saveModal} title="Enregistrer le document"
        onClose={() => setSaveModal(false)} confirmLabel="Enregistrer"
        onConfirm={() => void save()}>
        <Input label="Titre" value={title} onChangeText={setTitle} autoFocus
          accessibilityLabel="Titre du document" />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBackground, gap: spacing.md },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filtersRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.darkSurface,
  },
  filterChipActive: { backgroundColor: colors.primary },
  footer: {
    flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
