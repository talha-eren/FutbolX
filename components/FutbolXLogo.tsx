import { StyleSheet, View, Text, TextStyle, ViewStyle } from 'react-native';
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
  const iconSize = size * 0.8;
  const fontSize = size * 0.5;
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.logoCircle, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2
        }
      ]}>
        <IconSymbol name="soccerball" size={iconSize} color="white" />
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
  logoCircle: {
    backgroundColor: '#192f59', // Koyu mavi renk
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoText: {
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.5,
  }
});
