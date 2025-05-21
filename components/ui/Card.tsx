import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: DimensionValue;
  elevation?: number;
  border?: boolean;
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl';
}

export function Card({
  children,
  style,
  padding = 16,
  elevation = 2,
  border = false,
  rounded = 'md',
}: CardProps) {
  const isDark = useThemeColor({}, 'background') === '#121212';
  
  // Renk temaları
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = isDark ? '#2C2C2C' : '#E0E0E0';
  
  // Yuvarlaklık değerini belirle
  const getBorderRadius = () => {
    if (typeof rounded === 'boolean') {
      return rounded ? 8 : 0;
    }
    
    switch (rounded) {
      case 'sm': return 4;
      case 'lg': return 16;
      case 'xl': return 24;
      default: return 8; // md
    }
  };
  
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          backgroundColor,
          borderRadius: getBorderRadius(),
          borderWidth: border ? 1 : 0,
          borderColor,
          elevation: elevation,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: elevation / 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
}); 