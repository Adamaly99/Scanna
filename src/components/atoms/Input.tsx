import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors, spacing, radius, typography } from '@/constants/theme';

interface InputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: React.ReactNode;
}

export function Input({
  label,
  placeholder,
  error,
  value,
  onChangeText,
  containerStyle,
  multiline = false,
  numberOfLines = 1,
  icon,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.neutrals[400]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...rest}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.button,
    color: colors.neutrals[700],
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutrals[300],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutrals[900],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
});