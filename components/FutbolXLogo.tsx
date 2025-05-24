import { StyleSheet, View, Text, TextStyle, ViewStyle, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface FutbolXLogoProps {
  size?: number;
  showText?: boolean;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  subtitle?: string;
  showSubtitle?: boolean;
}

export function FutbolXLogo({ 
  size = 40, 
  showText = true, 
  textStyle, 
  containerStyle,
  subtitle = "Futbol tutkunlarını buluşturan platform",
  showSubtitle = false
}: FutbolXLogoProps) {
  const textColor = useThemeColor({}, 'text');
  const fontSize = size * 0.5;
  const subtitleSize = size * 0.25;
  
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
      
      <View style={styles.textContainer}>
      {showText && (
        <ThemedText style={[
          styles.logoText, 
          { fontSize }, 
          textStyle
        ]}>
          FutbolX
          </ThemedText>
      )}
        
        {showSubtitle && (
          <ThemedText style={[
            styles.subtitleText, 
            { fontSize: subtitleSize }
          ]}>
            {subtitle}
          </ThemedText>
        )}
      </View>
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
  textContainer: {
    flexDirection: 'column',
    marginLeft: 8,
  },
  logoText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitleText: {
    opacity: 0.8,
    marginTop: 2,
  }
});
