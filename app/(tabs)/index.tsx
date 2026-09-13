import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, Card } from '@/components/atoms';
import { useAppStore } from '@/stores/appStore';
import { useDocuments } from '@/hooks/useDocuments';
import { colors, spacing } from '@/constants/theme';
import { useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { initialize, isInitialized } = useAppStore();
  const { documents } = useDocuments();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          Bienvenue
        </Text>
        <Text variant="body" color={colors.neutrals[600]} style={styles.subtitle}>
          Scannez vos documents facilement
        </Text>

        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardTitle}>
            Démarrer
          </Text>
          <Button
            label="Nouveau scan"
            onPress={() => router.push('/scan')}
            style={styles.button}
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardTitle}>
            Documents récents
          </Text>
          <Text variant="body" color={colors.neutrals[600]}>
            {documents.length} document{documents.length > 1 ? 's' : ''}
          </Text>
        </Card>
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
});