import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    ...getContainerStyle(variant, isDisabled),
    ...getSizeStyle(size),
    ...style,
  };

  const textStyle: TextStyle = {
    ...getTextStyle(variant),
    ...getSizeTextStyle(size),
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyle}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outlined' || variant === 'ghost' ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyle}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function getContainerStyle(
  variant: ButtonProps['variant'],
  disabled: boolean
): ViewStyle {
  const baseStyle: ViewStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
  };

  const variants: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.brand,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  return {
    ...baseStyle,
    ...variants[variant || 'primary'],
    opacity: disabled ? 0.5 : 1,
  };
}

function getSizeStyle(size: ButtonProps['size']): ViewStyle {
  const sizes: Record<string, ViewStyle> = {
    sm: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    md: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    lg: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    },
  };

  return sizes[size || 'md'];
}

function getTextStyle(variant: ButtonProps['variant']): TextStyle {
  const textColor = variant === 'outlined' || variant === 'ghost' ? colors.primary : colors.white;

  return {
    color: textColor,
    fontWeight: '600',
  };
}

function getSizeTextStyle(size: ButtonProps['size']): TextStyle {
  const sizes: Record<string, TextStyle> = {
    sm: {
      fontSize: 12,
    },
    md: {
      fontSize: 14,
    },
    lg: {
      fontSize: 16,
    },
  };

  return sizes[size || 'md'];
}

const styles = StyleSheet.create({});