import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CompatibilityScoreProps {
  score: number;
  size?: number;
}

const CompatibilityScore: React.FC<CompatibilityScoreProps> = ({ score, size = 50 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Yeşil
    if (score >= 60) return '#FF9800'; // Turuncu
    if (score >= 40) return '#FFC107'; // Sarı
    return '#F44336'; // Kırmızı
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Mükemmel';
    if (score >= 80) return 'Çok İyi';
    if (score >= 70) return 'İyi';
    if (score >= 60) return 'Orta';
    return 'Düşük';
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Arka plan çemberi */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth="4"
          fill="transparent"
        />
        {/* İlerleme çemberi */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
          {score}%
        </Text>
        <Text style={styles.scoreLabel}>
          {getScoreText(score)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  scoreContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
});

export default CompatibilityScore; 