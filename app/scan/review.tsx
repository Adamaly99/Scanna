import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Card } from '@/components/atoms';
import { useScanner } from '@/hooks/useScanner';
import { useDocuments } from '@/hooks/useDocuments';
import { colors, spacing } from '@/constants/theme';
import { logger } from '@/services/logger';

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = (width - spacing.lg * 3) / 2;

export default function ReviewScreen() {
  const router = useRouter();
  const { pages, currentPageIndex, setCurrentPageIndex, retakeCurrentPage, completeScan } =
    useScanner();
  const { createDocument } = useDocuments();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (pages.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="h2">Aucun document</Text>
        <Button
          label="Retour"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const currentPage = pages[selectedIndex] || pages[0];

  const handleSave = async () => {
    try {
      logger.startTimer('save_document');

      const scanPages = await completeScan();

      const newDocument = await createDocument({
        title: `Document ${new Date().toLocaleDateString()}`,
        localPath: scanPages[0]?.imageUri || '',
        pageCount: scanPages.length,
        totalSize: 0,
        tags: [],
        ocrStatus: 'pending',
        folderId: null,
        pages: scanPages,
      });

      logger.endTimer('save_document');
      logger.info('Document saved', { id: newDocument.id });

      router.replace('/files');
    } catch (error) {
      logger.error('Failed to save document', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Current Page Preview */}
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: currentPage.imageUri }}
          style={styles.previewImage}
        />
      </View>

      {/* Page Counter */}
      <View style={styles.pageInfo}>
        <Text variant="body">
          Page {selectedIndex + 1} de {pages.length}
        </Text>
      </View>

      {/* Thumbnails */}
      <FlatList
        data={pages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.thumbnail,
              selectedIndex === index && styles.thumbnailSelected,
            ]}
            onPress={() => setSelectedIndex(index)}
          >
            <Image
              source={{ uri: item.imageUri }}
              style={styles.thumbnailImage}
            />
            <View style={styles.thumbnailLabel}>
              <Text
                style={[
                  styles.thumbnailLabelText,
                  selectedIndex === index && styles.thumbnailLabelTextSelected,
                ]}
              >
                {index + 1}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailsList}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="Retour caméra"
          variant="outlined"
          onPress={() => router.back()}
        />
        <Button
          label="Supprimer"
          variant="ghost"
          onPress={retakeCurrentPage}
        />
        <Button
          label="Enregistrer"
          onPress={handleSave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals[50],
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  pageInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  thumbnailsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  thumbnail: {
    marginRight: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    resizeMode: 'cover',
  },
  thumbnailLabel: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailLabelText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailLabelTextSelected: {
    color: colors.white,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
});