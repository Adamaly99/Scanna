import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { typography, colors } from '@/constants/theme';

type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'caption'
  | 'button';

interface TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  testID?: string;
}

export function Text({
  variant = 'body',
  children,
  color = colors.neutrals[900],
  style,
  numberOfLines,
  testID,
}: TextProps) {
  const variantStyle: TextStyle = {
    ...typography[variant],
    color,
  };

  return (
    <RNText
      style={[variantStyle, style]}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({});