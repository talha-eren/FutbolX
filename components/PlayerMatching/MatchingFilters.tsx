import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { MatchingPreferences } from '../../services/PlayerMatchingService';

interface MatchingFiltersProps {
  filters: MatchingPreferences;
  onFiltersChange: (filters: MatchingPreferences) => void;
  visible: boolean;
  onClose: () => void;
}

const MatchingFilters: React.FC<MatchingFiltersProps> = ({ filters, onFiltersChange, visible, onClose }) => {
  const [localFilters, setLocalFilters] = useState<MatchingPreferences>(filters);

  const positions = ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];
  const skillLevels = ['Başlangıç', 'Orta', 'İleri', 'Profesyonel'];

  const handlePositionToggle = (position: string) => {
    const currentPositions = localFilters.preferredPositions || [];
    const newPositions = currentPositions.includes(position)
      ? currentPositions.filter(p => p !== position)
      : [...currentPositions, position];
    
    setLocalFilters({
      ...localFilters,
      preferredPositions: newPositions
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const defaultFilters: MatchingPreferences = {
      maxDistance: 10,
      skillLevelRange: 1,
      ageRange: [18, 50],
      preferredPositions: [],
      preferredTimes: ['18:00-22:00'],
      onlyActiveUsers: true
    };
    setLocalFilters(defaultFilters);
  };

  const handleDistanceChange = (increment: boolean) => {
    const newDistance = increment 
      ? Math.min(localFilters.maxDistance + 5, 50)
      : Math.max(localFilters.maxDistance - 5, 5);
    
    setLocalFilters({
      ...localFilters,
      maxDistance: newDistance
    });
  };

  const handleAgeRangeChange = (isMin: boolean, increment: boolean) => {
    const [minAge, maxAge] = localFilters.ageRange;
    let newMinAge = minAge;
    let newMaxAge = maxAge;

    if (isMin) {
      newMinAge = increment 
        ? Math.min(minAge + 1, maxAge - 1)
        : Math.max(minAge - 1, 16);
    } else {
      newMaxAge = increment 
        ? Math.min(maxAge + 1, 60)
        : Math.max(maxAge - 1, minAge + 1);
    }

    setLocalFilters({
      ...localFilters,
      ageRange: [newMinAge, newMaxAge]
    });
  };

  const handleSkillRangeChange = (increment: boolean) => {
    const newRange = increment 
      ? Math.min(localFilters.skillLevelRange + 1, 3)
      : Math.max(localFilters.skillLevelRange - 1, 0);
    
    setLocalFilters({
      ...localFilters,
      skillLevelRange: newRange
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol name="xmark" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Filtreleme</Text>
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={styles.resetText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Mesafe Filtresi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Maksimum Mesafe: {localFilters.maxDistance} km
            </Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity 
                style={styles.sliderButton}
                onPress={() => handleDistanceChange(false)}
              >
                <IconSymbol name="minus" size={16} color="#4CAF50" />
              </TouchableOpacity>
              <View style={styles.sliderTrack}>
                <View 
                  style={[
                    styles.sliderFill, 
                    { width: `${(localFilters.maxDistance / 50) * 100}%` }
                  ]} 
                />
              </View>
              <TouchableOpacity 
                style={styles.sliderButton}
                onPress={() => handleDistanceChange(true)}
              >
                <IconSymbol name="plus" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Yaş Aralığı */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Yaş Aralığı: {localFilters.ageRange[0]} - {localFilters.ageRange[1]}
            </Text>
            <View style={styles.ageContainer}>
              <View style={styles.ageControl}>
                <Text style={styles.ageLabel}>Min: {localFilters.ageRange[0]}</Text>
                <View style={styles.ageButtons}>
                  <TouchableOpacity 
                    style={styles.ageButton}
                    onPress={() => handleAgeRangeChange(true, false)}
                  >
                    <IconSymbol name="minus" size={14} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.ageButton}
                    onPress={() => handleAgeRangeChange(true, true)}
                  >
                    <IconSymbol name="plus" size={14} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.ageControl}>
                <Text style={styles.ageLabel}>Max: {localFilters.ageRange[1]}</Text>
                <View style={styles.ageButtons}>
                  <TouchableOpacity 
                    style={styles.ageButton}
                    onPress={() => handleAgeRangeChange(false, false)}
                  >
                    <IconSymbol name="minus" size={14} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.ageButton}
                    onPress={() => handleAgeRangeChange(false, true)}
                  >
                    <IconSymbol name="plus" size={14} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Pozisyon Filtresi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tercih Edilen Pozisyonlar</Text>
            <View style={styles.positionGrid}>
              {positions.map((position) => (
                <TouchableOpacity
                  key={position}
                  style={[
                    styles.positionButton,
                    localFilters.preferredPositions?.includes(position) && styles.positionButtonActive
                  ]}
                  onPress={() => handlePositionToggle(position)}
                >
                  <Text style={[
                    styles.positionButtonText,
                    localFilters.preferredPositions?.includes(position) && styles.positionButtonTextActive
                  ]}>
                    {position}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Seviye Filtresi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seviye Aralığı</Text>
            <Text style={styles.sectionSubtitle}>
              Kendi seviyenizden ±{localFilters.skillLevelRange} seviye
            </Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity 
                style={styles.sliderButton}
                onPress={() => handleSkillRangeChange(false)}
              >
                <IconSymbol name="minus" size={16} color="#4CAF50" />
              </TouchableOpacity>
              <View style={styles.sliderTrack}>
                <View 
                  style={[
                    styles.sliderFill, 
                    { width: `${(localFilters.skillLevelRange / 3) * 100}%` }
                  ]} 
                />
              </View>
              <TouchableOpacity 
                style={styles.sliderButton}
                onPress={() => handleSkillRangeChange(true)}
              >
                <IconSymbol name="plus" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
            <Text style={styles.applyButtonText}>Filtreleri Uygula</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resetText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  ageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  ageControl: {
    flex: 1,
  },
  ageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ageButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  positionButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  positionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  positionButtonTextActive: {
    color: 'white',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchingFilters; 