/**
 * FutbolX uygulaması için renk şeması
 * Web sitesi tasarımına uygun olarak güncellenmiştir
 */

// Ana renkler
export const primaryColor = '#4CAF50';     // Yeşil - Futbol çimini temsil eden ana renk
export const secondaryColor = '#388E3C';   // Koyu yeşil - Vurgu rengi
const accentColor = '#8BC34A';      // Açık yeşil - İkincil vurgu rengi
const neutralColor = '#F5F5F5';     // Açık gri - Nötr arka plan rengi
export const backgroundColor = '#FFFFFF';  // Beyaz - Ana arka plan rengi
export const textColor = '#212121';       // Koyu gri - Ana metin rengi

// Metin renkleri
const darkText = '#212121';         // Koyu metin rengi
const mediumText = '#757575';       // Orta metin rengi
const lightText = '#FFFFFF';        // Açık metin rengi

// Uyarı renkleri
const successColor = '#4CAF50';     // Başarı rengi
const warningColor = '#FFC107';     // Uyarı rengi
const errorColor = '#F44336';       // Hata rengi
const infoColor = '#2196F3';        // Bilgi rengi

export const Colors = {
  light: {
    text: darkText,
    secondaryText: mediumText,
    background: '#FFFFFF',
    secondaryBackground: neutralColor,
    tint: primaryColor,
    secondaryTint: secondaryColor,
    accent: accentColor,
    icon: mediumText,
    tabIconDefault: mediumText,
    tabIconSelected: primaryColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    info: infoColor,
    card: '#FFFFFF',
    border: '#E0E0E0',
  },
  dark: {
    text: lightText,
    secondaryText: '#BDBDBD',
    background: '#121212',
    secondaryBackground: '#1E1E1E',
    tint: accentColor,
    secondaryTint: primaryColor,
    accent: secondaryColor,
    icon: '#BDBDBD',
    tabIconDefault: '#BDBDBD',
    tabIconSelected: accentColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    info: infoColor,
    card: '#1E1E1E',
    border: '#333333',
  },
};
