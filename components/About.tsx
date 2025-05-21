import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { FutbolXLogo } from './FutbolXLogo';
import { IconSymbol } from './ui/IconSymbol';
import { Card } from './ui/Card';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Button } from './ui/Button';

interface AboutProps {
  showFull?: boolean;
}

export function About({ showFull = true }: AboutProps) {
  const isDark = useThemeColor({}, 'background') === '#121212';
  const primaryColor = '#1976D2';
  const textColor = useThemeColor({}, 'text');
  
  // Sosyal medya bağlantıları
  const socialLinks = [
    { name: 'Instagram', icon: 'camera', url: 'https://instagram.com/sporyum23' },
    { name: 'Twitter', icon: 'bubble.left', url: 'https://twitter.com/sporyum23' },
    { name: 'Website', icon: 'globe', url: 'https://sporyum23.com' },
  ];
  
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Bağlantı açılamadı:', err));
  };
  
  return (
    <Card style={styles.container} elevation={3} rounded="lg">
      <View style={styles.header}>
        <FutbolXLogo size={50} showText={true} />
        {!showFull && (
          <Button 
            title="Daha Fazla" 
            variant="outline"
            size="sm"
            onPress={() => {}}
          />
        )}
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={showFull}
        contentContainerStyle={!showFull ? { paddingBottom: 16 } : undefined}
      >
        <ThemedText style={styles.sectionTitle}>Hakkımızda</ThemedText>
        <ThemedText style={styles.paragraph}>
          Sporyum23, Türkiye'nin en kapsamlı halı saha ve spor tesisleri platformudur. Amacımız, sporseverlerin en uygun tesisleri bulmasını, maç arkadaşları edinmesini ve spor deneyimlerini paylaşmasını kolaylaştırmaktır.
        </ThemedText>
        
        {showFull && (
          <>
            <ThemedText style={styles.sectionTitle}>Vizyonumuz</ThemedText>
            <ThemedText style={styles.paragraph}>
              Spor aktivitelerini herkes için erişilebilir kılarak, daha sağlıklı ve aktif bir toplum oluşturmak için çalışıyoruz. Teknoloji ile sporu birleştirerek, kullanıcılarımıza en iyi deneyimi sunuyoruz.
            </ThemedText>
            
            <ThemedText style={styles.sectionTitle}>Özelliklerimiz</ThemedText>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <IconSymbol name="mappin.and.ellipse" size={20} color={primaryColor} />
                <ThemedText style={styles.featureText}>Halı saha tesislerini keşfedin</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="soccerball" size={20} color={primaryColor} />
                <ThemedText style={styles.featureText}>Maçlar oluşturun ve katılın</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="calendar" size={20} color={primaryColor} />
                <ThemedText style={styles.featureText}>Etkinlikleri takip edin</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="video" size={20} color={primaryColor} />
                <ThemedText style={styles.featureText}>Video ve fotoğraflarınızı paylaşın</ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="person.3" size={20} color={primaryColor} />
                <ThemedText style={styles.featureText}>Futbol topluluğuna katılın</ThemedText>
              </View>
            </View>
          </>
        )}
        
        <ThemedText style={styles.sectionTitle}>İletişim</ThemedText>
        <ThemedText style={styles.contactText}>
          Sorularınız veya önerileriniz için: info@sporyum23.com
        </ThemedText>
        
        {showFull && (
          <>
            <View style={styles.socialLinks}>
              {socialLinks.map((link, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.socialButton}
                  onPress={() => handleLinkPress(link.url)}
                >
                  <IconSymbol 
                    name={link.icon as any} 
                    size={18} 
                    color="#FFFFFF" 
                  />
                  <ThemedText style={styles.socialText}>{link.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            
            <ThemedText style={styles.copyrightText}>
              © {new Date().getFullYear()} Sporyum23. Tüm hakları saklıdır.
            </ThemedText>
          </>
        )}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  content: {
    maxHeight: 500,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
  },
  featureList: {
    marginVertical: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
  },
  contactText: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  socialText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 13,
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.6,
  },
}); 