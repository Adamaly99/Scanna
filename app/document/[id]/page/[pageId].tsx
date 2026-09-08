import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { documentRepository } from '@/database/documentRepository';

export default function PageViewer() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const page = documentRepository.getPage(pageId ?? '');
  if (!page) return <View style={styles.bg} />;
  return (
    <View style={styles.bg}>
      <Image source={{ uri: page.processedPath ?? page.imagePath }}
        style={StyleSheet.absoluteFill} contentFit="contain" recyclingKey={page.id} />
    </View>
  );
}

const styles = StyleSheet.create({ bg: { flex: 1, backgroundColor: '#000' } });
