import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  containerStyle?: ViewStyle;
}

export function Loader({
  size = 'large',
  color = colors.primary,
  containerStyle,
}: LoaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});