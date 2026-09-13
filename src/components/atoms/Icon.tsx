import React from 'react';
import { View, ViewStyle } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  // Placeholder - replace with actual icon library (Feather, Ionicons, etc.)
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.5,
        },
        style,
      ]}
    />
  );
}