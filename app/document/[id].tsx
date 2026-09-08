import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocumentsStore } from '@/stores/documentsStore';
import { documentRepository } from '@/database/documentRepository';
import { pdfService } from '@/pdf/pdfService';
import { shareFile } from '@/sharing/shareService';
import { sanitizeFilename, formatBytes } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';
import { usePremium } from '@/hooks/useSubscriptionGate';

export default function DocumentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const store = useDocumentsStore();
  const doc = store.documents.find((d) => d.id === id) ?? documentRepository.getById(id ?? '');
  const pages = doc ? documentRepository.listPages(doc.id) : [];
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(doc?.title ?? '');
  const [ocrOpen, setOcrOpen] = useState(false);
  const [buildingPdf, setBuildingPdf] = useState(false);
  const { premium, goPremium } = usePremium();

  if (!doc) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState icon="warning" title="Document introuvable"
          message="Ce document a peut-être été supprimé." />
      </SafeAreaView>
    );
  }

  const buildAndSharePdf = async () => {
    if (!premium) { goPremium('L’export PDF avancé fait partie de Scana Premium.'); return; }
    setBuildingPdf(true);
    const res = await pdfService.build(pages, {
      pageSize: 'A4', quality: 'high', color: true,
      filename: sanitizeFilename(doc.title),
    });
    setBuildingPdf(false);
    if (!res.ok) { toast('Génération PDF impossible', 'error'); return; }
    const shared = await shareFile(res.value.uri, 'application/pdf');
    if (!shared.ok && shared.error !== 'cancelled') {
      toast(shared.error === 'file_missing' ? 'Fichier introuvable' : 'Partage indisponible', 'error');
    }
  };

  const copyOcr = async () => {
    const text = pages.map((p) => p.ocrText ?? '').filter(Boolean).join('\n\n');
    if (!text) { toast('OCR en cours ou indisponible', 'info'); return; }
    if (!premium) { goPremium('La copie du texte OCR fait partie de Scana Premium.'); return; }
    await Share.share({ message: text });
  };

  const ocrStatusLabel: Record<string, string> = {
    pending: 'OCR en attente', processing: 'OCR en cours…',
    done: 'Texte extrait', failed: 'OCR échoué', none: 'Aucun texte détecté',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Retour">
          <Icon name="arrowLeft" size={24} color={colors.text} />
        </Pressable>
        <Text style={[typography.h3, { color: colors.text, flex: 1 }]} numberOfLines={1}>{doc.title}</Text>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={12} accessibilityLabel="Options du document">
          <Icon name="dots" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pages.map((p, i) => (
            <Pressable key={p.id} onPress={() => router.push(`/document/${doc.id}/page/${p.id}`)}
              accessibilityLabel={`Page ${i + 1}`}>
              <Image source={{ uri: p.processedPath ?? p.imagePath }}
                style={{ width: 120, height: 160, borderRadius: radius.sm, marginRight: spacing.sm }}
                recyclingKey={p.id} transition={150} />
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.metaCard}>
          <Meta label="Pages" value={String(doc.pageCount)} />
          <Meta label="Taille" value={formatBytes(doc.fileSize)} />
          <Meta label="OCR" value={ocrStatusLabel[pages[0]?.ocrStatus ?? 'none'] ?? ''} />
        </View>

        <View style={styles.actionsGrid}>
          <Action icon="pdf" label="Exporter PDF" loading={buildingPdf} onPress={() => void buildAndSharePdf()} />
          <Action icon="text" label="Copier le texte" onPress={() => void copyOcr()} />
          <Action icon="star" label={doc.isFavorite ? 'Retirer favori' : 'Favori'}
            onPress={() => store.toggleFavorite(doc.id)} />
          <Action icon="lock" label={doc.isProtected ? 'Déprotéger' : 'Protéger'}
            onPress={() => void store.toggleProtected(doc.id)} />
          <Action icon="edit" label="Renommer" onPress={() => { setNewTitle(doc.title); setRenameOpen(true); }} />
          <Action icon="trash" label="Supprimer" onPress={() => {
            Alert.alert('Supprimer ce document ?', 'Cette action est définitive.', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: () => {
                void store.remove(doc.id).then(() => router.back());
              }},
            ]);
          }} />
        </View>
      </ScrollView>

      <Modal visible={renameOpen} title="Renommer" onClose={() => setRenameOpen(false)}
        confirmLabel="Renommer" onConfirm={() => { store.rename(doc.id, newTitle); setRenameOpen(false); }}>
        <Input value={newTitle} onChangeText={setNewTitle} autoFocus accessibilityLabel="Nouveau titre" />
      </Modal>

      <Modal visible={menuOpen} title={doc.title} onClose={() => setMenuOpen(false)}>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
          Créé le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
        </Text>
        <Button label="Voir le texte OCR" variant="secondary" onPress={() => { setMenuOpen(false); setOcrOpen(true); }} />
      </Modal>

      <Modal visible={ocrOpen} title="Texte extrait (OCR)" onClose={() => setOcrOpen(false)}>
        <ScrollView style={{ maxHeight: 360 }}>
          <Text style={[typography.mono, { color: colors.text }]}>
            {pages.map((p) => p.ocrText).filter(Boolean).join('\n\n') || 'Aucun texte pour le moment. L’OCR s’exécute en arrière-plan.'}
          </Text>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[typography.caption, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[typography.bodySmall, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function Action({ icon, label, onPress, loading }: {
  icon: IconName; label: string; onPress: () => void; loading?: boolean;
}) {
  return (
    <Pressable style={styles.action} onPress={onPress} accessibilityRole="button"
      accessibilityLabel={label} disabled={loading}>
      {loading ? <Text style={{ color: colors.primary }}>…</Text> : <Icon name={icon} size={22} color={colors.primary} />}
      <Text style={[typography.caption, { color: colors.text, textAlign: 'center' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  metaCard: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.md,
  },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: {
    width: '31%', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md,
    minHeight: 76,
  },
});
