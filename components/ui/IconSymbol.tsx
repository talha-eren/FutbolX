// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'plus.circle': 'add-circle',
  'person': 'person',
  'magnifyingglass': 'search',
  'soccerball': 'sports-soccer',
  'location': 'location-on',
  'sparkles': 'auto-awesome',
  'sportscourt': 'sports',
  'calendar': 'event',
  'mappin': 'place',
  // Auth ekranları için ikonlar
  'envelope': 'email',
  'lock': 'lock',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'at': 'alternate-email',
  // Yeni eklenen eksik ikonlar
  'heart': 'favorite',
  'bubble.right': 'chat',
  'square.and.arrow.up': 'share',
  'location.fill': 'location-on',
  'pencil': 'edit',
  'arrow.right.square': 'logout',
  'person.fill': 'person',
  'clock.arrow.circlepath': 'restore',
  'phone.fill': 'phone',
  'envelope.fill': 'email',
  'star': 'star-border',
  'star.fill': 'star',
  'star.leadinghalf.filled': 'star-half',
  // Konsolda görülen eksik ikonlar
  'list.bullet': 'format-list-bulleted',
  'play.fill': 'play-arrow',
  'video': 'videocam',
  'mappin.and.ellipse': 'place',
  'clock': 'access-time',
  'turkishlirasign.circle': 'monetization-on', // En yakın para birimi ikonu
  'film': 'movie', // Eksik film ikonu eklendi
  'lock.fill': 'lock',
  // Yeni eksik ikonlar (hata mesajında görülen)
  'video.badge.plus': 'video-call',
  'square.grid.2x2': 'apps',
  'plus': 'add',
  'calendar.badge.exclamationmark': 'event-busy',
  'doc.text.fill': 'description',
  'medal': 'military-tech',
  'figure.walk': 'directions-walk',
  'rectangle.portrait.and.arrow.right': 'logout',
  'gear': 'settings',
  'chevron.left': 'chevron-left',
  'exclamationmark.triangle': 'warning',
  // Yeni eklenen eksik ikonlar (hata mesajlarında görülenler)
  'person.2': 'people', // Birden fazla kişi ikonu
  'photo': 'photo',
  'doc.text': 'description',
  'trash': 'delete',
  'xmark.circle.fill': 'cancel',
  'checkmark.circle': 'check-circle',
  'person.circle.fill': 'account-circle',
  'football': 'sports-soccer',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Eğer ikon adı MAPPING'de yoksa 'help-outline' ikonunu göster
  const iconName = MAPPING[name] || 'help-outline';
  
  // Konsolda hata ayıklama mesajı
  if (!MAPPING[name]) {
    console.warn(`IconSymbol: '${name}' için MaterialIcons eşleştirmesi bulunamadı. MAPPING'e ekleyin.`);
  }
  
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
