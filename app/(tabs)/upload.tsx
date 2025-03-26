import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, Platform, TextInput, ScrollView, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

export default function UploadScreen() {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const isWeb = Platform.OS === 'web';

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedMedia(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking media:', error);
    }
  };

  const handleUpload = () => {
    if (!selectedMedia) {
      alert('Lütfen bir video seçin');
      return;
    }

    if (!title.trim()) {
      alert('Lütfen bir başlık girin');
      return;
    }

    setIsUploading(true);

    // Upload progress simülasyonu
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setSelectedMedia(null);
          setDescription('');
          setTitle('');
          setHashtags('');
          setUploadProgress(0);
          alert('Video başarıyla yüklendi!');
        }, 500);
      }
    }, 300);
  };

  const renderUploadSection = () => (
    <View style={[styles.uploadSection, { borderColor }]}>
      {selectedMedia ? (
        <View style={styles.selectedMediaContainer}>
          <Image
            source={{ uri: selectedMedia }}
            style={styles.selectedMedia}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: tintColor }]}
            onPress={() => setSelectedMedia(null)}
          >
            <IconSymbol name="trash" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, { borderColor }]}
          onPress={pickImage}
        >
          <IconSymbol name="video" size={50} color={tintColor} />
          <ThemedText style={styles.uploadText}>Video Seç</ThemedText>
          <ThemedText style={styles.uploadSubtext}>
            MP4, AVI, MOV formatları desteklenir
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDetailsForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Başlık</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          placeholder="Videonuza bir başlık verin"
          placeholderTextColor={borderColor}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Açıklama</ThemedText>
        <TextInput
          style={[styles.textArea, { color: textColor, borderColor }]}
          placeholder="Videonuzu açıklayın"
          placeholderTextColor={borderColor}
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Etiketler</ThemedText>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          placeholder="#futbol #gol #süperlig"
          placeholderTextColor={borderColor}
          value={hashtags}
          onChangeText={setHashtags}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: tintColor, opacity: selectedMedia ? 1 : 0.5 },
        ]}
        onPress={handleUpload}
        disabled={!selectedMedia || isUploading}
      >
        <ThemedText style={styles.submitButtonText}>
          {isUploading ? `Yükleniyor... ${uploadProgress}%` : 'Videoyu Yükle'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={[styles.container, isWeb && styles.webContainer]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Yeni Video Yükle</ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderUploadSection()}
          {renderDetailsForm()}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 80 : 50,
  },
  webContainer: {
    maxWidth: 800,
    marginHorizontal: 'auto',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  uploadSection: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 24,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
  },
  selectedMediaContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedMedia: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
