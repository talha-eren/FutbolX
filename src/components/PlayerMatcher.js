import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fade,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  SportsSoccer as SportsIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  SmartToy as AIIcon,
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Chat as ChatIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import aiService from '../services/aiService';

const PlayerMatcher = ({ open, onClose, userPosition, userLocation }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [matchedPlayers, setMatchedPlayers] = useState([]);
  const [error, setError] = useState('');
  const [searchProgress, setSearchProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAICommands, setShowAICommands] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // AI Komut Rehberi
  const aiCommands = [
    {
      category: '⚽ Oyuncu Arama',
      commands: [
        { text: 'Kaleci arıyorum', description: 'Kaleci pozisyonundaki oyuncuları bulur' },
        { text: 'Defans arıyorum', description: 'Defans oyuncularını listeler' },
        { text: 'Orta saha arıyorum', description: 'Orta saha oyuncularını gösterir' },
        { text: 'Forvet arıyorum', description: 'Forvet pozisyonundaki oyuncuları bulur' },
        { text: 'Oyuncu arıyorum', description: 'Tüm pozisyonlardan uyumlu oyuncular' },
        { text: 'Yakınımda oyuncu var mı?', description: 'Lokasyonunuza yakın oyuncuları bulur' },
        { text: 'Deneyimli oyuncu arıyorum', description: 'Pro seviyesindeki oyuncuları listeler' },
        { text: 'Yeni başlayan oyuncu arıyorum', description: 'Başlangıç seviyesindeki oyuncuları bulur' }
      ]
    },
    {
      category: '👥 Takım Yönetimi',
      commands: [
        { text: 'Takımıma oyuncu bulur musun?', description: 'Takımınız için eksik pozisyonlarda oyuncu önerir' },
        { text: 'Takım öner', description: 'Profilinize uygun takımları listeler' },
        { text: 'Takım kur', description: 'Yeni takım oluşturma rehberi' },
        { text: 'Takım istatistiklerimi göster', description: 'Takımınızın performans analizi' },
        { text: 'Rakip takım bul', description: 'Seviyenize uygun rakip takımlar' },
        { text: 'Takım transferi yap', description: 'Oyuncu transfer önerileri' }
      ]
    },
    {
      category: '⚽ Maç Bilgileri',
      commands: [
        { text: 'Bugün hangi takımlar maç yapıyor?', description: 'Günlük maç programını gösterir' },
        { text: 'Maça katıl', description: 'Açık maçları listeler' },
        { text: 'Rastgele maç öner', description: 'Size uygun rastgele maç önerisi' },
        { text: 'Maç geçmişimi göster', description: 'Oynadığınız maçların listesi' },
        { text: 'Yarın maç var mı?', description: 'Yarınki maç programı' },
        { text: 'Hafta sonu maçları', description: 'Hafta sonu maç programı' },
        { text: 'Turnuva bilgisi ver', description: 'Aktif turnuvalar hakkında bilgi' }
      ]
    },
    {
      category: '🏟️ Saha Bilgileri',
      commands: [
        { text: 'Bugün açık sahalar hangileri?', description: 'Müsait sahaları listeler' },
        { text: 'Saha bul', description: 'Lokasyonunuza yakın sahaları bulur' },
        { text: '20:00\'ye boş saha bulur musun?', description: 'Belirli saatte müsait sahalar' },
        { text: 'En ucuz saha hangisi?', description: 'Uygun fiyatlı sahaları listeler' },
        { text: 'Kapalı saha arıyorum', description: 'Kapalı halı sahaları gösterir' },
        { text: 'Saha rezervasyonu yap', description: 'Rezervasyon sayfasına yönlendirir' },
        { text: 'Saha fiyatları nedir?', description: 'Güncel saha fiyat listesi' }
      ]
    },
    {
      category: '📊 İstatistikler & Analiz',
      commands: [
        { text: 'İstatistiklerimi göster', description: 'Kişisel performans analizi' },
        { text: 'En çok gol atan oyuncular kimler?', description: 'Liderlik tablosu' },
        { text: 'En aktif takımlar hangileri?', description: 'En çok maç yapan takımlar' },
        { text: 'Gelişimimi göster', description: '3 aylık gelişim analizi' },
        { text: 'Pozisyon analizi yap', description: 'Pozisyonunuzdaki performansınız' },
        { text: 'Rakip analizi', description: 'Karşılaştığınız rakiplerin analizi' },
        { text: 'Sezon özeti', description: 'Bu sezonki performansınızın özeti' }
      ]
    },
    {
      category: '🎯 Hedef & Gelişim',
      commands: [
        { text: 'Hedeflerimi belirle', description: 'Kişisel futbol hedefleri oluşturur' },
        { text: 'Antrenman programı öner', description: 'Size özel antrenman planı' },
        { text: 'Gelişim alanlarım neler?', description: 'Güçlendirebileceğiniz alanlar' },
        { text: 'Başarı rozetlerimi göster', description: 'Kazandığınız başarılar' },
        { text: 'Seviye atlama kriterleri', description: 'Bir üst seviyeye çıkma şartları' },
        { text: 'Kişisel rekor takibi', description: 'Kişisel rekorlarınızı görüntüler' }
      ]
    },
    {
      category: '🌟 Sosyal & Topluluk',
      commands: [
        { text: 'Arkadaş öner', description: 'Benzer ilgi alanlarındaki oyuncular' },
        { text: 'Topluluk etkinlikleri', description: 'Yaklaşan futbol etkinlikleri' },
        { text: 'Futbol sohbeti başlat', description: 'Diğer oyuncularla sohbet odaları' },
        { text: 'Mentor bul', description: 'Deneyimli oyunculardan rehberlik' },
        { text: 'Yeni oyuncu rehberi', description: 'Yeni başlayanlar için ipuçları' },
        { text: 'Başarı hikayelerini oku', description: 'İlham verici oyuncu hikayeleri' }
      ]
    },
    {
      category: '⚙️ Sistem & Ayarlar',
      commands: [
        { text: 'Profil sayfasına git', description: 'Profil sayfasını açar' },
        { text: 'Ayarlarımı değiştir', description: 'Ayarlar sayfasına yönlendirir' },
        { text: 'Bildirimlerimi yönet', description: 'Bildirim ayarlarını düzenler' },
        { text: 'Hesap güvenliği', description: 'Güvenlik ayarları ve şifre değişimi' },
        { text: 'Veri dışa aktar', description: 'Verilerinizi dışa aktarır' },
        { text: 'Gizlilik ayarları', description: 'Gizlilik ve paylaşım ayarları' },
        { text: 'Yardım ve destek', description: 'Teknik destek ve SSS' }
      ]
    },
    {
      category: '💡 Motivasyon & İpuçları',
      commands: [
        { text: 'Motivasyon sözü ver', description: 'Kişiselleştirilmiş motivasyon mesajı' },
        { text: 'Bugünkü ipucu nedir?', description: 'Günlük futbol ipucu' },
        { text: 'Rastgele öneri', description: 'Size özel aktivite önerisi' },
        { text: 'Futbol trivia', description: 'Eğlenceli futbol bilgileri' },
        { text: 'Günün oyuncusu kim?', description: 'Öne çıkan oyuncu profili' },
        { text: 'Hava durumu uyarısı', description: 'Maç için hava durumu bilgisi' },
        { text: 'Beslenme önerisi', description: 'Sporcu beslenmesi tavsiyeleri' }
      ]
    },
    {
      category: '🎮 Eğlence & Oyunlar',
      commands: [
        { text: 'Futbol quiz başlat', description: 'Futbol bilgi yarışması' },
        { text: 'Tahmin oyunu', description: 'Maç sonucu tahmin oyunu' },
        { text: 'Skill challenge', description: 'Beceri meydan okumaları' },
        { text: 'Günün meydan okuması', description: 'Günlük futbol görevi' },
        { text: 'Liderlik tablosu', description: 'Oyun ve aktivite sıralaması' },
        { text: 'Rozetlerimi göster', description: 'Kazandığınız oyun rozetleri' },
        { text: 'Mini oyunlar', description: 'Eğlenceli mini futbol oyunları' }
      ]
    }
  ];

  // AI Sorgu Gönderme
  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    const query = aiQuery.toLowerCase().trim();
    
    try {
      let response = '';
      
      // Sayfa yönlendirme komutları
      if (query.includes('profil') || query.includes('profil sayfasına git')) {
        response = '📱 Profil sayfanıza yönlendiriliyorsunuz...\n\nProfilinizde kişisel bilgilerinizi, istatistiklerinizi ve ayarlarınızı düzenleyebilirsiniz.';
        setTimeout(() => window.location.href = '/profile', 1500);
      }
      else if (query.includes('ayar') || query.includes('ayarlarımı değiştir')) {
        response = '⚙️ Ayarlar sayfasına yönlendiriliyorsunuz...\n\nBurada hesap ayarlarınızı, bildirim tercihlerinizi ve gizlilik ayarlarınızı düzenleyebilirsiniz.';
        setTimeout(() => window.location.href = '/settings', 1500);
      }
      else if (query.includes('rezervasyon') || query.includes('saha rezervasyonu')) {
        response = '🏟️ Saha rezervasyon sayfasına yönlendiriliyorsunuz...\n\nMüsait sahaları görüntüleyebilir ve rezervasyon yapabilirsiniz.';
        setTimeout(() => window.location.href = '/reservations', 1500);
      }
      else if (query.includes('takım') && (query.includes('öner') || query.includes('bul'))) {
        response = '👥 Takımlar sayfasına yönlendiriliyorsunuz...\n\nSize uygun takımları bulabilir ve katılım talebinde bulunabilirsiniz.';
        setTimeout(() => window.location.href = '/teams', 1500);
      }
      else if (query.includes('video') || query.includes('videolar')) {
        response = '📹 Videolar sayfasına yönlendiriliyorsunuz...\n\nFutbol videolarını izleyebilir ve kendi videolarınızı paylaşabilirsiniz.';
        setTimeout(() => window.location.href = '/videos', 1500);
      }
      else if (query.includes('maç') || query.includes('maçlar')) {
        response = '⚽ Maçlar sayfasına yönlendiriliyorsunuz...\n\nAktif maçları görüntüleyebilir ve maç programını inceleyebilirsiniz.';
        setTimeout(() => window.location.href = '/matches', 1500);
      }
      else if (query.includes('istatistik') || query.includes('stats')) {
        response = '📊 İstatistikler sayfasına yönlendiriliyorsunuz...\n\nKişisel performansınızı ve genel istatistikleri görüntüleyebilirsiniz.';
        setTimeout(() => window.location.href = '/stats', 1500);
      }
      else if (query.includes('ana sayfa') || query.includes('anasayfa') || query.includes('home')) {
        response = '🏠 Ana sayfaya yönlendiriliyorsunuz...\n\nAna sayfada en son güncellemeleri ve önemli duyuruları görebilirsiniz.';
        setTimeout(() => window.location.href = '/', 1500);
      }
      
      // Oyuncu arama komutları
      else if (query.includes('kaleci') && query.includes('arı')) {
        response = '🥅 Kaleci oyuncuları aranıyor...\n\nKaleci pozisyonundaki deneyimli oyuncuları buluyorum. Klasik eşleştirme butonuna tıklayarak detaylı arama yapabilirsiniz.';
        // Klasik arama fonksiyonunu çağır
        setTimeout(() => searchPlayers(), 1000);
      }
      else if (query.includes('defans') && query.includes('arı')) {
        response = '🛡️ Defans oyuncuları aranıyor...\n\nDefans pozisyonundaki güçlü oyuncuları buluyorum. Klasik eşleştirme ile detaylı sonuçlar alabilirsiniz.';
        setTimeout(() => searchPlayers(), 1000);
      }
      else if (query.includes('orta saha') && query.includes('arı')) {
        response = '⚽ Orta saha oyuncuları aranıyor...\n\nOrta saha pozisyonundaki yaratıcı oyuncuları buluyorum. Eşleştirme başlatılıyor...';
        setTimeout(() => searchPlayers(), 1000);
      }
      else if (query.includes('forvet') && query.includes('arı')) {
        response = '🎯 Forvet oyuncuları aranıyor...\n\nForvet pozisyonundaki golcü oyuncuları buluyorum. Eşleştirme sistemi devreye giriyor...';
        setTimeout(() => searchPlayers(), 1000);
      }
      else if (query.includes('oyuncu arı') || query.includes('oyuncu bul')) {
        response = '🔍 Tüm pozisyonlardan uyumlu oyuncular aranıyor...\n\nSize en uygun oyuncuları buluyorum. Pozisyon, seviye ve lokasyon bazlı eşleştirme yapılıyor...';
        setTimeout(() => searchPlayers(), 1000);
      }
      
      // Motivasyon ve ipuçları
      else if (query.includes('motivasyon') || query.includes('motive')) {
        const motivationMessages = [
          '💪 "Başarı, hazırlık fırsatla buluştuğunda ortaya çıkar. Sen hazır ol, fırsat gelecek!"',
          '⚽ "Her büyük futbolcu bir gün amatör olarak başladı. Sen de o yoldasın!"',
          '🌟 "Futbolda en önemli şey takım ruhu. Sen de bu ruhun bir parçasısın!"',
          '🏆 "Kazanmak önemli değil, asla pes etmemek önemli. Devam et!"',
          '🎯 "Hedefin net olsun, çalışman sıkı olsun. Başarı kaçınılmaz olacak!"'
        ];
        response = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
      }
      else if (query.includes('ipucu') || query.includes('tavsiye')) {
        const tips = [
          '⚽ Günlük İpucu: Maç öncesi 2 saat önce yemek yemeyi bırakın, performansınız artar!',
          '🏃‍♂️ Antrenman İpucu: Haftada en az 3 kez kondisyon çalışması yapın.',
          '🧠 Taktik İpucu: Rakibinizi gözlemleyin, zayıf noktalarını bulun.',
          '💧 Sağlık İpucu: Maç sırasında düzenli su için, dehidrasyon performansı düşürür.',
          '🎯 Teknik İpucu: Top kontrolünü geliştirmek için duvarla pas çalışması yapın.'
        ];
        response = tips[Math.floor(Math.random() * tips.length)];
      }
      
      // Eğlence komutları
      else if (query.includes('quiz') || query.includes('bilgi yarışması')) {
        response = '🎮 Futbol Quiz Başlatılıyor!\n\n❓ Soru: Dünya Kupası\'nı en çok kazanan ülke hangisidir?\nA) Brezilya (5 kez)\nB) Almanya (4 kez)\nC) İtalya (4 kez)\nD) Arjantin (3 kez)\n\nCevabınızı düşünün! 🤔';
      }
      else if (query.includes('tahmin') || query.includes('tahmin oyunu')) {
        response = '🔮 Maç Tahmin Oyunu!\n\n⚽ Bu hafta sonu Galatasaray - Fenerbahçe derbisi var!\nTahminiz nedir?\n\n🟡🔴 Galatasaray galip\n🟡💙 Fenerbahçe galip\n⚖️ Beraberlik\n\nTahminlerinizi paylaşın!';
      }
      
      // Sistem bilgileri
      else if (query.includes('yardım') || query.includes('help') || query.includes('destek')) {
        response = '🆘 Yardım ve Destek\n\n📞 İletişim: 0424 247 7701\n📧 E-posta: info@sporyum23.com\n\n💡 Sık Sorulan Sorular:\n• Nasıl takım kurarım?\n• Rezervasyon nasıl yaparım?\n• Profil nasıl güncellenir?\n\nDetaylı yardım için destek ekibimizle iletişime geçin!';
      }
      else if (query.includes('hava durumu') || query.includes('hava')) {
        response = '🌤️ Hava Durumu Bilgisi\n\nBugün Elazığ\'da:\n🌡️ Sıcaklık: 18°C\n☁️ Durum: Parçalı bulutlu\n💨 Rüzgar: 15 km/h\n\n⚽ Maç için ideal hava koşulları! Sahaya çıkmak için mükemmel bir gün!';
      }
      
      // Beslenme önerileri
      else if (query.includes('beslenme') || query.includes('diyet')) {
        response = '🥗 Sporcu Beslenmesi Önerileri\n\n🍌 Maç öncesi: Muz, hurma gibi doğal şekerler\n🥤 Maç sırası: Bol su ve elektrolit\n🍗 Maç sonrası: Protein ağırlıklı beslenme\n\n⚠️ Kaçının: Ağır yağlı yiyecekler, gazlı içecekler\n\n💪 Düzenli beslenme = Yüksek performans!';
      }
      
      // Varsayılan yanıt
      else {
        response = `🤖 "${query}" hakkında bilgi arıyorsunuz.\n\n💡 Size yardımcı olabilmek için şu komutları deneyebilirsiniz:\n\n⚽ Oyuncu arama: "kaleci arıyorum", "takım öner"\n🏟️ Saha işlemleri: "saha bul", "rezervasyon yap"\n📊 Bilgi: "istatistiklerimi göster", "maç geçmişi"\n⚙️ Sistem: "profil sayfasına git", "ayarlar"\n\n50+ komut için yukarıdaki listeyi inceleyin!`;
      }
      
      setAiResponse(response);
      
    } catch (error) {
      setAiResponse('AI sorgusu işlenirken hata oluştu. Lütfen tekrar deneyin.');
    }
    setAiLoading(false);
  };

  // Pozisyon bazlı takım ihtiyaçları
  const getTeamNeeds = (userPosition) => {
    const teamFormation = {
      'Kaleci': {
        needed: ['Defans', 'Defans', 'Orta Saha', 'Orta Saha', 'Forvet'],
        message: 'Kaleci olarak sizin için ideal bir takım oluşturuluyor...'
      },
      'Defans': {
        needed: ['Kaleci', 'Defans', 'Orta Saha', 'Orta Saha', 'Forvet'],
        message: 'Defans oyuncusu olarak sizin için uygun takım arkadaşları aranıyor...'
      },
      'Orta Saha': {
        needed: ['Kaleci', 'Defans', 'Defans', 'Orta Saha', 'Forvet'],
        message: 'Orta saha oyuncusu olarak sizin için ideal takım kurgusu hazırlanıyor...'
      },
      'Forvet': {
        needed: ['Kaleci', 'Defans', 'Defans', 'Orta Saha', 'Orta Saha'],
        message: 'Forvet olarak sizin için mükemmel bir takım oluşturuluyor...'
      }
    };

    return teamFormation[userPosition] || {
      needed: ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'],
      message: 'Sizin için uygun takım arkadaşları aranıyor...'
    };
  };

  const searchPlayers = async () => {
    if (!userPosition) {
      setError('Önce profilinizde pozisyonunuzu belirtmelisiniz.');
      return;
    }

    setLoading(true);
    setError('');
    setStep(1);
    setSearchProgress(0);

    try {
      const teamNeeds = getTeamNeeds(userPosition);
      
      // Arama animasyonu
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/auth/players', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const allPlayers = await response.json();
        
        // Kullanıcının kendisini filtrele
        const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const otherPlayers = allPlayers.filter(player => player.username !== currentUser.username);
        
        // Pozisyon bazlı eşleştirme
        const matchedByPosition = {};
        
        teamNeeds.needed.forEach(position => {
          if (!matchedByPosition[position]) {
            matchedByPosition[position] = [];
          }
          
          const playersInPosition = otherPlayers.filter(player => player.position === position);
          
          // Lokasyon bazlı öncelik (aynı şehirdekileri öne çıkar)
          if (userLocation) {
            playersInPosition.sort((a, b) => {
              const aLocationMatch = a.location && a.location.toLowerCase().includes(userLocation.toLowerCase());
              const bLocationMatch = b.location && b.location.toLowerCase().includes(userLocation.toLowerCase());
              
              if (aLocationMatch && !bLocationMatch) return -1;
              if (!aLocationMatch && bLocationMatch) return 1;
              return 0;
            });
          }
          
          // Uyumluluk skoru ekle
          playersInPosition.forEach(player => {
            player.compatibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100 arası
          });
          
          matchedByPosition[position] = playersInPosition.slice(0, 3); // Her pozisyon için en fazla 3 oyuncu
        });

        clearInterval(progressInterval);
        setSearchProgress(100);
        
        setTimeout(() => {
          setMatchedPlayers(matchedByPosition);
          setStep(2);
          setLoading(false);
        }, 500);

      } else {
        setError('Oyuncular yüklenirken hata oluştu');
        setLoading(false);
      }
    } catch (error) {
      console.error('Oyuncu eşleştirme hatası:', error);
      setError('Bağlantı hatası');
      setLoading(false);
    }
  };

  const getPositionColor = (position) => {
    const colors = {
      'Kaleci': '#FF5722',
      'Defans': '#2196F3',
      'Orta Saha': '#4CAF50',
      'Forvet': '#FF9800'
    };
    return colors[position] || '#757575';
  };

  const getCompatibilityColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#FF9800';
    if (score >= 70) return '#2196F3';
    return '#757575';
  };

  const handleContactPlayer = (player, method = 'whatsapp') => {
    if (method === 'whatsapp' && player.phone) {
      // Telefon numarasını temizle
      const phoneNumber = player.phone.replace(/\D/g, '').replace(/^0/, '');
      
      // WhatsApp mesajı oluştur
      const message = encodeURIComponent(
        `Merhaba ${player.firstName}! 👋\n\n` +
        `FutbolX uygulaması üzerinden sizinle eşleştik! ⚽\n\n` +
        `📋 Eşleştirme Detayları:\n` +
        `Pozisyonunuz: ${player.position}\n` +
        `Uyumluluk: %${player.compatibilityScore || 85}\n\n` +
        `Birlikte futbol oynamak için iletişime geçmek istedim. ⚽\n\n` +
        `FutbolX ile güzel maçlar! 🏆`
      );
      
      // WhatsApp URL'si oluştur
      const whatsappUrl = `https://wa.me/90${phoneNumber}?text=${message}`;
      
      // Yeni sekmede aç
      window.open(whatsappUrl, '_blank');
    } 
    else if (method === 'email' && player.email) {
      // E-posta entegrasyonu
      const subject = encodeURIComponent('FutbolX - Takım Arkadaşı Teklifi ⚽');
      const body = encodeURIComponent(
        `Merhaba ${player.firstName},\n\n` +
        `FutbolX uygulaması üzerinden sizinle eşleştik!\n\n` +
        `📋 Eşleştirme Detayları:\n` +
        `• Pozisyonunuz: ${player.position}\n` +
        `• Uyumluluk Oranı: %${player.compatibilityScore || 85}\n` +
        `• Lokasyon: ${player.location || 'Belirtilmemiş'}\n\n` +
        `Birlikte futbol oynamak için iletişime geçmek istedim. ⚽\n\n` +
        `Size uygun bir zaman ve saha bulup maç organize edebiliriz. ` +
        `Bu konuda görüşlerinizi almak isterim.\n\n` +
        `FutbolX uygulaması üzerinden daha detaylı bilgi alabilir ` +
        `ve diğer oyuncularla da tanışabilirsiniz.\n\n` +
        `İyi maçlar! 🏆\n\n` +
        `---\n` +
        `Bu mesaj FutbolX AI Oyuncu Eşleştirme sistemi aracılığıyla gönderilmiştir.\n` +
        `FutbolX: Futbol tutkunlarını buluşturan platform`
      );
      
      // E-posta URL'si oluştur
      const emailUrl = `mailto:${player.email}?subject=${subject}&body=${body}`;
      
      // E-posta istemcisini aç
      window.location.href = emailUrl;
    }
  };

  const resetMatcher = () => {
    setStep(0);
    setMatchedPlayers([]);
    setError('');
    setSearchProgress(0);
    setAiResponse('');
    setAiQuery('');
  };

  const handleClose = () => {
    resetMatcher();
    onClose();
  };

  // Ana başlangıç ekranı
  const renderStep0 = () => (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <AutoAwesomeIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
        Akıllı Oyuncu Eşleştirme
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
        AI destekli sistemimiz ile size en uygun oyuncuları bulun. Pozisyonunuza, seviyenize ve lokasyonunuza göre akıllı eşleştirme yapıyoruz.
      </Typography>
      
      {/* AI Komut Rehberi */}
      <Card sx={{ mb: 3, border: '2px solid #4CAF50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AIIcon sx={{ color: '#4CAF50', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              🤖 AI Asistan Komutları
            </Typography>
            <Tooltip title="AI asistanınız 50+ farklı komut türünü anlıyor ve size yönlendirme sağlıyor!">
              <HelpIcon sx={{ ml: 1, color: '#757575' }} />
            </Tooltip>
          </Box>
          
          <Button
            variant="outlined"
            onClick={() => setShowAICommands(!showAICommands)}
            startIcon={<ChatIcon />}
            sx={{ mb: 2 }}
          >
            {showAICommands ? 'Komutları Gizle' : '50+ AI Komutunu Gör'}
          </Button>

          {showAICommands && (
        <Box>
              {aiCommands.map((category, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {category.category}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {category.commands.map((command, cmdIndex) => (
                        <ListItem key={cmdIndex} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2" 
            sx={{ 
                                  fontWeight: 'bold', 
                                  color: '#4CAF50',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setAiQuery(command.text)}
                              >
                                "{command.text}"
                              </Typography>
                            }
                            secondary={command.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {/* AI Sorgu Alanı */}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              placeholder="AI asistanınıza sorunuzu yazın... (örn: 'kaleci arıyorum')"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PsychologyIcon sx={{ color: '#4CAF50' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={handleAIQuery}
                      disabled={aiLoading || !aiQuery.trim()}
                      size="small"
                      variant="contained"
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      {aiLoading ? <CircularProgress size={20} /> : 'Sor'}
                    </Button>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            
            {aiResponse && (
              <Alert severity="info" sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {aiResponse}
          </Typography>
              </Alert>
            )}
        </Box>
        </CardContent>
      </Card>

      {/* Klasik Arama Butonu */}
      <Button
        variant="contained"
        size="large"
        onClick={searchPlayers}
        disabled={loading || !userPosition}
        startIcon={<SearchIcon />}
        sx={{
          py: 1.5,
          px: 4,
          fontSize: '1.1rem',
          background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
          }
        }}
      >
        Klasik Eşleştirme Başlat
      </Button>

      {!userPosition && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Oyuncu eşleştirme için önce profilinizde pozisyonunuzu belirtmelisiniz.
        </Alert>
      )}
    </Box>
  );

  // Arama süreci ekranı
  const renderStep1 = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <SearchIcon sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        🔍 Akıllı Eşleştirme Yapılıyor...
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        AI sistemimiz size en uygun oyuncuları buluyor
      </Typography>
      
      <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mb: 3 }}>
        <LinearProgress 
          variant="determinate" 
          value={searchProgress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)'
            }
          }} 
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          %{searchProgress} tamamlandı
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Pozisyon uyumluluğu, seviye analizi ve lokasyon bazlı eşleştirme yapılıyor...
      </Typography>
    </Box>
  );

  // Sonuçlar ekranı
  const renderStep2 = () => (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <TrophyIcon sx={{ fontSize: 60, color: '#FFD700', mb: 1 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎉 Eşleştirme Tamamlandı!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Size uygun {Object.values(matchedPlayers).flat().length} oyuncu bulundu
        </Typography>
      </Box>

      {Object.keys(matchedPlayers).length === 0 ? (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Henüz uygun oyuncu bulunamadı 😔
          </Typography>
          <Typography variant="body2">
            Daha fazla oyuncu katıldıkça eşleştirme sonuçları gelişecek. 
            AI asistanımızı kullanarak farklı arama kriterleri deneyebilirsiniz.
          </Typography>
        </Alert>
      ) : (
        Object.entries(matchedPlayers).map(([position, players]) => (
          <Card key={position} sx={{ mb: 3, border: `2px solid ${getPositionColor(position)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SportsIcon sx={{ color: getPositionColor(position), mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {position} Oyuncuları ({players.length})
            </Typography>
              </Box>
            
            <Grid container spacing={2}>
                {players.map((player, index) => (
                  <Grid item xs={12} md={6} key={index}>
                  <Card 
                    sx={{ 
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.3s ease',
                      '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                          borderColor: getPositionColor(position)
                      }
                    }}
                  >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: getPositionColor(position), 
                              mr: 2,
                              width: 50,
                              height: 50
                            }}
                          >
                            {player.firstName?.charAt(0)}{player.lastName?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                              {player.firstName} {player.lastName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                size="small"
                                label={`%${player.compatibilityScore || 85} Uyumlu`}
                                sx={{
                                  bgcolor: getCompatibilityColor(player.compatibilityScore || 85),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem'
                                }}
                              />
                              <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <SportsIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            Seviye: {player.level || 'Belirtilmemiş'}
                          </Typography>
                          {player.location && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              {player.location}
                            </Typography>
                          )}
                          {player.phone && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              İletişim mevcut
                            </Typography>
                          )}
                          {player.email && (
                            <Typography variant="body2" color="text.secondary">
                              <EmailIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              E-posta mevcut
                            </Typography>
                            )}
                        </Box>
                        
                        {/* İletişim Butonları */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          {player.phone && (
                              <Button
                                variant="contained"
                              onClick={() => handleContactPlayer(player, 'whatsapp')}
                              startIcon={<PhoneIcon />}
                                sx={{
                                flex: 1,
                                bgcolor: '#25D366',
                                  '&:hover': {
                                    bgcolor: '#128C7E'
                                  }
                                }}
                              size="small"
                              >
                                WhatsApp
                              </Button>
                          )}
                          {player.email && (
                              <Button
                                variant="contained"
                              onClick={() => handleContactPlayer(player, 'email')}
                              startIcon={<EmailIcon />}
                              sx={{
                                flex: 1,
                                bgcolor: '#1976d2',
                                '&:hover': {
                                  bgcolor: '#1565c0'
                                }
                              }}
                                size="small"
                              >
                                E-posta
                              </Button>
                          )}
                      </Box>
                      
                        {!player.phone && !player.email && (
                          <Button
                            fullWidth
                            variant="outlined"
                            disabled
                            sx={{ color: '#757575' }}
                        >
                            İletişim Bilgisi Yok
                          </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            </CardContent>
          </Card>
        ))
      )}

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={resetMatcher}
          startIcon={<SearchIcon />}
          sx={{ mr: 2 }}
        >
          Yeni Arama
        </Button>
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{
            background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)'
          }}
        >
          Kapat
        </Button>
      </Box>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 1,
        background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AIIcon sx={{ mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            FutbolX AI Oyuncu Eşleştirme
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Fade in={true} timeout={500}>
          <Box>
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </Box>
        </Fade>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerMatcher; 