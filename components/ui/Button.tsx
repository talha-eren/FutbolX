import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '../ThemedText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDark = useThemeColor({}, 'background') === '#121212';
  
  // Sporyum23 renk şeması
  const colors = {
    primary: '#1976D2',
    primaryDark: '#0D47A1',
    primaryLight: '#42A5F5',
    secondary: isDark ? '#2C2C2C' : '#F5F7FA',
    danger: '#F44336',
    disabled: isDark ? '#424242' : '#E0E0E0',
    text: isDark ? '#FFFFFF' : '#333333',
    textDisabled: '#888888',
    outline: 'transparent',
  };
  
  // Buton boyutuna göre stil hesapla
  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 6,
          fontSize: 13,
        };
      case 'lg':
        return {
          paddingVertical: 16,
          paddingHorizontal: 28,
          borderRadius: 10,
          fontSize: 16,
        };
      default: // 'md'
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          fontSize: 14,
        };
    }
  };
  
  // Varyasyona göre stil hesapla
  const getVariantStyle = () => {
    const buttonSize = getButtonSize();
    
    const baseStyle = {
      paddingVertical: buttonSize.paddingVertical,
      paddingHorizontal: buttonSize.paddingHorizontal,
      borderRadius: buttonSize.borderRadius,
      opacity: disabled ? 0.6 : 1,
    };
    
    const textSizeStyle = {
      fontSize: buttonSize.fontSize,
    };
    
    switch (variant) {
      case 'secondary':
        return {
          button: {
            ...baseStyle,
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: isDark ? '#555' : '#DDD',
          },
          text: {
            ...textSizeStyle,
            color: colors.primary,
            fontWeight: '600' as const,
          },
        };
      case 'outline':
        return {
          button: {
            ...baseStyle,
            backgroundColor: colors.outline,
            borderWidth: 2,
            borderColor: colors.primary,
          },
          text: {
            ...textSizeStyle,
            color: colors.primary,
            fontWeight: '600' as const,
          },
        };
      case 'ghost':
        return {
          button: {
            ...baseStyle,
            backgroundColor: 'transparent',
          },
          text: {
            ...textSizeStyle,
            color: colors.primary,
            fontWeight: '600' as const,
          },
        };
      case 'danger':
        return {
          button: {
            ...baseStyle,
            backgroundColor: colors.danger,
          },
          text: {
            ...textSizeStyle,
            color: '#FFFFFF',
            fontWeight: '600' as const,
          },
        };
      default: // 'primary'
        return {
          button: {
            ...baseStyle,
            backgroundColor: colors.primary,
          },
          text: {
            ...textSizeStyle,
            color: '#FFFFFF',
            fontWeight: '600' as const,
          },
        };
    }
  };
  
  const variantStyle = getVariantStyle();
  
  // İkon ve yükleme durumu için düzenleme
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary} 
        />
      );
    }
    
    const iconElement = icon ? (
      <View style={{ marginRight: iconPosition === 'left' ? 8 : 0, marginLeft: iconPosition === 'right' ? 8 : 0 }}>
        {icon}
      </View>
    ) : null;
    
    return (
      <>
        {iconPosition === 'left' && iconElement}
        <ThemedText style={[variantStyle.text, textStyle]}>
          {title}
        </ThemedText>
        {iconPosition === 'right' && iconElement}
      </>
    );
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        variantStyle.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 