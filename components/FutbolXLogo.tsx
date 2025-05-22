import { StyleSheet, View, Text, TextStyle, ViewStyle, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface FutbolXLogoProps {
  size?: number;
  showText?: boolean;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

export function FutbolXLogo({ size = 40, showText = true, textStyle, containerStyle }: FutbolXLogoProps) {
  const textColor = useThemeColor({}, 'text');
  const fontSize = size * 0.5;
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.logoContainer, 
        { 
          width: size, 
          height: size, 
        }
      ]}>
        <Image 
          source={require('../assets/images/logo512.png')} 
          style={{ width: size, height: size }} 
          resizeMode="contain"
        />
      </View>
      
      {showText && (
        <ThemedText style={[
          styles.logoText, 
          { fontSize }, 
          textStyle
        ]}>
          FutbolX
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.5,
  }
});
