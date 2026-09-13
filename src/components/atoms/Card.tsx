import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { colors, spacing, radius, shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'md',
}: CardProps) {
  const Container = onPress ? TouchableOpacity : View;

  const paddingValue = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  }[padding];

  const baseStyle: ViewStyle = {
    borderRadius: radius.lg,
    padding: paddingValue,
    backgroundColor: colors.white,
  };

  const variantStyle: ViewStyle =
    variant === 'outlined'
      ? {
          borderWidth: 1,
          borderColor: colors.neutrals[200],
        }
      : {
          ...shadows.md,
        };

  return (
    <Container
      style={[baseStyle, variantStyle, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({});