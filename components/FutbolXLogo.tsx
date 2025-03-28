import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Svg, { Circle, Path, G, Rect, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

interface FutbolXLogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  simplified?: boolean;
}

export function FutbolXLogo({ 
  size = 100, 
  showText = true, 
  textColor,
  simplified = false 
}: FutbolXLogoProps) {
  const primaryColor = '#009945'; // Daha canlı yeşil
  const secondaryColor = '#00538B'; // Koyu mavi
  const accentColor = '#FF4500'; // Daha canlı turuncu
  const defaultTextColor = useThemeColor({}, 'text');
  const resolvedTextColor = textColor || defaultTextColor;
  
  const logoSize = size;
  
  // Basitleştirilmiş logo
  if (simplified) {
    return (
      <View style={[styles.container, { width: size, height: showText ? size + 30 : size }]}>
        <Svg width={logoSize} height={logoSize} viewBox="0 0 100 100">
          {/* Stadyum/Saha background */}
          <Defs>
            <LinearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={primaryColor} />
              <Stop offset="100%" stopColor="#006400" />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#fieldGradient)" />
          
          {/* Saha çizgileri */}
          <Circle cx="50" cy="50" r="40" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx="50" cy="50" r="5" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <Path d="M 50 10 L 50 90" stroke="#FFFFFF" strokeWidth="3" />
          
          {/* Futbol topu */}
          <Circle cx="50" cy="35" r="15" fill="#FFFFFF" />
          <Path d="M 45 25 L 55 25 L 58 35 L 50 45 L 42 35 Z" fill="#000000" />
          
          {/* X işareti */}
          <Path d="M 30 60 L 45 75 M 45 60 L 30 75" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
        </Svg>
        
        {showText && (
          <View style={styles.textContainer}>
            <ThemedText style={[styles.logoText, { color: resolvedTextColor }]}>
              <ThemedText style={[styles.logoTextBold, { color: resolvedTextColor }]}>Futbol</ThemedText>
              <ThemedText style={[styles.logoTextAccent, { color: accentColor }]}>X</ThemedText>
            </ThemedText>
          </View>
        )}
      </View>
    );
  }
  
  // Tam detaylı profesyonel logo
  return (
    <View style={[styles.container, { width: size, height: showText ? size + 30 : size }]}>
      <Svg width={logoSize} height={logoSize} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="stadiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={primaryColor} />
            <Stop offset="100%" stopColor="#006400" />
          </LinearGradient>
          <LinearGradient id="ballGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#F0F0F0" />
          </LinearGradient>
        </Defs>
        
        {/* Stadyum arka plan */}
        <Circle cx="50" cy="50" r="48" fill="url(#stadiumGradient)" />
        <Circle cx="50" cy="50" r="44" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        
        {/* Stadyum koltukları ve detaylar */}
        <Circle cx="50" cy="50" r="36" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <Circle cx="50" cy="50" r="8" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <Path d="M 50 6 L 50 94" stroke="#FFFFFF" strokeWidth="3" />
        <Path d="M 6 50 L 94 50" stroke="#FFFFFF" strokeWidth="3" />
        
        {/* Standlar */}
        <Path d="M 20 20 L 80 20 L 90 50 L 80 80 L 20 80 L 10 50 Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        
        {/* Futbol topu - daha detaylı ve parlak */}
        <Circle cx="50" cy="34" r="20" fill="url(#ballGradient)" stroke="#E0E0E0" strokeWidth="0.5" />
        
        {/* Top üzerindeki siyah beşgenler - daha net */}
        <Polygon 
          points="50,18 65,26 60,42 40,42 35,26"
          fill="#222222" 
        />
        <Path d="M 33 28 L 25 36 L 35 46" fill="#222222" />
        <Path d="M 67 28 L 75 36 L 65 46" fill="#222222" />
        <Path d="M 40 44 L 35 52 L 50 55" fill="#222222" />
        <Path d="M 60 44 L 65 52 L 50 55" fill="#222222" />
        
        {/* Parlaklık efekti */}
        <Circle cx="40" cy="25" r="5" fill="#FFFFFF" opacity="0.3" />
        
        {/* X simgesi - daha canlı ve 3D görünümlü */}
        <G transform="translate(30, 55) scale(0.4)">
          <Path 
            d="M 10 10 L 90 90" 
            stroke={accentColor} 
            strokeWidth="16" 
            strokeLinecap="round"
          />
          <Path 
            d="M 90 10 L 10 90" 
            stroke={accentColor} 
            strokeWidth="16" 
            strokeLinecap="round"
          />
          {/* Gölge efekti */}
          <Path 
            d="M 13 13 L 93 93" 
            stroke="#000000" 
            strokeWidth="16" 
            strokeLinecap="round"
            opacity="0.2"
            transform="translate(3, 3)"
          />
          <Path 
            d="M 93 13 L 13 93" 
            stroke="#000000" 
            strokeWidth="16" 
            strokeLinecap="round"
            opacity="0.2"
            transform="translate(3, 3)"
          />
        </G>
      </Svg>
      
      {showText && (
        <View style={styles.textContainer}>
          <ThemedText style={[styles.logoText, { color: resolvedTextColor }]}>
            <ThemedText style={[styles.logoTextBold, { color: resolvedTextColor }]}>Futbol</ThemedText>
            <ThemedText style={[styles.logoTextAccent, { color: accentColor }]}>X</ThemedText>
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '500',
  },
  logoTextBold: {
    fontWeight: 'bold',
  },
  logoTextAccent: {
    fontSize: 26,
    fontWeight: 'bold',
  }
});
