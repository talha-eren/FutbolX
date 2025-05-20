import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Link
} from '@mui/material';
import { 
  LocationOn, 
  Phone, 
  Email, 
  Facebook, 
  Twitter, 
  Instagram, 
  ArrowForward, 
  VerifiedUser, 
  People, 
  EmojiEvents, 
  SportsSoccer,
  LocalParking,
  Pool,
  Restaurant,
  Shower,
  LocalCafe,
  DirectionsCar,
  AccessTime
} from '@mui/icons-material';

const AboutPage = () => {
  // Takım üyeleri
  const teamMembers = [
    {
      name: 'Mustafa Yıldırım',
      title: 'Kurucu ve Genel Müdür',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&w=400&q=80',
      bio: 'Mustafa Bey, 2015 yılında Sporyum tesislerini Elazığ\'da kurdu. Futbol tutkusu ve işletmecilik deneyimi ile tesisimizi bölgenin en popüler spor komplekslerinden biri haline getirdi.'
    },
    {
      name: 'Ahmet Koç',
      title: 'İşletme Müdürü',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&w=400&q=80',
      bio: 'Ahmet Bey, 12 yıllık spor tesisi yönetimi deneyimi ile ekibimize 2017 yılında katıldı. Müşteri memnuniyeti ve kaliteli hizmet anlayışı ile tesislerimizin standardını sürekli yükseltiyor.'
    },
    {
      name: 'Zeynep Çelik',
      title: 'Pazarlama ve Etkinlik Koordinatörü',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&w=400&q=80',
      bio: 'Zeynep Hanım, dijital pazarlama alanındaki uzmanlığı ile 2019\'dan beri ekibimizde. Sosyal medya stratejileri ve yerel turnuva organizasyonları ile Elazığ\'daki futbol kültürünü canlandırıyor.'
    },
    {
      name: 'Mehmet Şahin',
      title: 'Antrenör ve Akademi Direktörü',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&w=400&q=80',
      bio: 'Eski profesyonel futbolcu Mehmet Bey, Sporyum Futbol Akademisinin başında yer alıyor. Elazığ\'daki genç yeteneklerin keşfedilmesi ve geliştirilmesi konusunda uzmanlaşmıştır.'
    }
  ];

  // Tesisler listesi
  const locations = [
    {
      name: 'Sporium 23 Halı Saha',
      address: 'Cumhuriyet Mah. F. Ahmet Baba Bulvarı No:110, Tedaş Kavşağı Türk Telekom Arkası, Elazığ',
      phone: '0424 247 7701',
      mobile: '0555 732 6476',
      image: 'https://images.unsplash.com/photo-1547366785-564103df7e13?auto=format&fit=crop&w=600&q=80',
      maps: 'https://maps.app.goo.gl/wPQB4eqvV7bwWMDy9',
      features: ['3 Adet Kapalı Halı Saha', 'Kafeterya', 'WiFi', 'Duş ve Soyunma Odaları', 'Otopark', 'Kredi Kartı İle Ödeme']
    },
    {
      name: 'Yeni Elazığ Stadyumu',
      address: 'Atatürk Bulvarı ve Zübeyde Hanım Caddesi arası, Elazığ',
      phone: '',
      image: 'https://images.unsplash.com/photo-1553627220-92f0446b6a1f?auto=format&fit=crop&w=600&q=80',
      maps: 'https://maps.app.goo.gl/wPQB4eqvV7bwWMDy9',
      features: ['23.000 Kişilik Kapasite', 'Modern Tasarım', 'FIFA Standartlarında Futbol Sahası', 'Kapalı Tribünler']
    },
    {
      name: 'Elazığ Halı Saha Kompleksi',
      address: 'Çarşı Mah. Gazi Cad. No:45, Elazığ',
      phone: '0424 238 9890',
      image: 'https://images.unsplash.com/photo-1516983340650-a6a03c7e1532?auto=format&fit=crop&w=600&q=80',
      maps: 'https://maps.app.goo.gl/wPQB4eqvV7bwWMDy9',
      features: ['2 Adet Halı Saha', 'Hızlı Rezervasyon', 'Merkezi Konum', 'Amatör Turnuvalar']
    }
  ];

  // Özellikler
  const facilities = [
    { icon: <SportsSoccer />, title: 'Profesyonel Sahalar', description: 'Yüksek kaliteli çim dokusuna sahip, profesyonel standartlarda halı sahalar' },
    { icon: <LocalParking />, title: 'Ücretsiz Otopark', description: 'Tesisimize ait güvenli ve ücretsiz otopark alanı' },
    { icon: <Shower />, title: 'Modern Soyunma Odaları', description: 'Duş, soyunma ve kişisel dolaplar içeren temiz ve bakımlı alanlar' },
    { icon: <LocalCafe />, title: 'Kafeterya', description: 'Zengin menüsü ile maç öncesi ve sonrası keyifli vakit geçirebileceğiniz cafe' },
    { icon: <AccessTime />, title: 'Kredi Kartı İle Ödeme', description: 'Nakit veya kredi kartı ile ödeme yapabilme imkanı' },
    { icon: <VerifiedUser />, title: 'WiFi', description: 'Tüm tesiste ücretsiz yüksek hızlı WiFi hizmeti' }
  ];

  // Tarihçe olayları
  const historyEvents = [
    {
      year: 2019,
      title: 'Yeni Elazığ Stadyumu İnşaatı',
      description: 'Elazığ\'da 23.000 kapasiteli modern stadyumun inşaatına başlandı.'
    },
    {
      year: 2020,
      title: 'Sporium 23 Kuruluşu',
      description: 'Sporium 23 tesisleri Cumhuriyet Mahallesi\'nde 3 halı saha ile hizmete başladı.'
    },
    {
      year: 2021,
      title: 'İlk Turnuva',
      description: 'Elazığ Şirketler Ligi ilk kez Sporium 23 tesislerinde düzenlendi ve büyük ilgi gördü.'
    },
    {
      year: 2022,
      title: 'Stadyum Tamamlandı',
      description: 'Elazığ\'ın yeni 23.000 kapasiteli stadyumu tamamlanarak hizmete girdi.'
    },
    {
      year: 2023,
      title: 'Dijital Dönüşüm',
      description: 'Online rezervasyon sistemi ve mobil uygulama hizmete sunuldu, temassız ödeme sistemine geçildi.'
    },
    {
      year: 2024,
      title: 'Tesis Yenileme',
      description: 'Sporium 23 tesislerimiz modernize edildi ve yeni ekipmanlarla donatıldı.'
    }
  ];

  return (    <Box sx={{ py: 5 }}>      <Container maxWidth="lg">        {/* Hero Bölümü */}        <Box           sx={{             position: 'relative',            height: {xs: '400px', md: '500px'},            borderRadius: 4,            overflow: 'hidden',            mb: 8,            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'          }}        >          <Box             sx={{               position: 'absolute',              top: 0,              left: 0,              right: 0,              bottom: 0,              backgroundImage: 'url(https://images.unsplash.com/photo-1511426420268-4cfdd3763b77?auto=format&fit=crop&w=1200&q=80)',              backgroundSize: 'cover',              backgroundPosition: 'center',              '&:before': {                content: '""',                position: 'absolute',                top: 0,                left: 0,                right: 0,                bottom: 0,                background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',                zIndex: 1              }            }}          />                    <Box             sx={{               position: 'relative',              zIndex: 2,              height: '100%',              display: 'flex',              flexDirection: 'column',              justifyContent: 'center',              p: { xs: 3, md: 6 }            }}          >            <Box sx={{ maxWidth: {xs: '100%', md: '60%'} }}>              <Typography                 variant="h2"                 component="h1"                 fontWeight="bold"                sx={{                   color: 'white',                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',                  mb: 2                }}              >                SPORIUM 23 HALI SAHA              </Typography>              <Typography                 variant="h5"                 sx={{                   color: 'white',                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',                  mb: 3                }}              >                Elazığ'ın En Modern Halı Saha ve Spor Tesisi              </Typography>              <Typography                 variant="body1"                 sx={{                   color: 'white',                  opacity: 0.9,                  mb: 4,                  maxWidth: '90%'                }}              >                2020 yılından bu yana Elazığ'da profesyonel halı saha ve spor tesisi olarak kaliteli sahalarımız, modern tesislerimiz ve profesyonel hizmet anlayışımız ile sporseverlere hizmet vermekteyiz.              </Typography>              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>                <Button                   variant="contained"                   color="primary"                   size="large"                  sx={{                     px: 4,                     py: 1.5,                     fontWeight: 'bold',                    fontSize: '1rem',                    borderRadius: 3,                    boxShadow: '0 4px 14px rgba(76,175,80,0.4)'                  }}                >                  Rezervasyon Yap                </Button>                <Button                   variant="outlined"                   sx={{                     px: 4,                     py: 1.5,                     fontWeight: 'bold',                    fontSize: '1rem',                    borderRadius: 3,                    borderColor: 'white',                    color: 'white',                    '&:hover': {                      borderColor: 'white',                      bgcolor: 'rgba(255,255,255,0.1)'                    }                  }}                >                  İletişime Geç                </Button>              </Box>            </Box>          </Box>        </Box>                {/* Başlık Bölümü */}        <Box sx={{
          mb: 8,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box sx={{ px: { xs: 2, md: 4 } }}>
                <Typography
                  variant="h2"
                  component="h2"
                  gutterBottom
                  fontWeight="bold"
                  sx={{
                    color: 'primary.main',
                    position: 'relative',
                    display: 'inline-block',
                    mb: 3,
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      width: '100px',
                      height: '4px',
                      bottom: '-10px',
                      left: 0,
                      backgroundColor: 'primary.main',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Sporium 23 Hakkında
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
                  <strong>Sporium 23 Halı Saha</strong>, Elazığ'ın en modern ve kaliteli halı saha kompleksidir. 2020 yılında kurulmuş olan tesisimiz, futbol tutkunlarının buluşma noktası haline gelmiştir.
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  Tesisimizde <strong>3 adet kapalı halı saha</strong> bulunmaktadır. Sahalarımız yüksek kalite çim dokusuna sahip olup, FIFA standartlarına uygun şekilde donatılmıştır. Modern aydınlatma sistemimiz gece maçlarında da mükemmel görüş sağlar.
                </Typography>
                
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  <strong>Sporium 23</strong> olarak amacımız, sporseverlere en iyi halı saha deneyimini yaşatmaktır. Kafeterya, duş ve soyunma odaları, ücretsiz otopark ve WiFi hizmetlerimizle misafirlerimizin konforunu en üst düzeyde tutmaktayız.
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 4 }}>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(76, 175, 80, 0.1)', 
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      <SportsSoccer sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" color="primary" fontWeight="bold">3 Kapalı Saha</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(76, 175, 80, 0.1)', 
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      <AccessTime sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" color="primary" fontWeight="bold">09:00 - 01:00</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Paper 
                elevation={8}
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  height: '100%',
                  minHeight: 450,
                  boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                }}
              >
                <Box 
                  component="img"
                  src="https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=800&q=80"
                  alt="Halı Saha"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
                  p: 3,
                  color: 'white'
                }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>Elazığ'da Futbolun Yeni Adresi</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Modern, temiz ve kaliteli sahalarımızda maç yapmanın keyfini çıkarın.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="large"
                    sx={{ 
                      fontWeight: 'bold',
                      px: 4,
                      borderRadius: 2
                    }}
                  >
                    Rezervasyon Yap
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Vizyonumuz ve Misyonumuz */}
        <Grid container spacing={6} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                backgroundImage: 'linear-gradient(to bottom right, #4CAF50, #388E3C)',
                color: 'white',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                backgroundImage: 'url(https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=500&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.15
              }} />
              
              <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  width: 80, 
                  height: 80, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%'
                }}>
                  <SportsSoccer sx={{ fontSize: 50, color: 'white' }} />
                </Box>
                
                <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                  Neden Sporium 23?
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', mr: 2 }} />
                    Profesyonel standartlarda sahalar
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', mr: 2 }} />
                    Modern ve temiz soyunma odaları
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', mr: 2 }} />
                    Kolay rezervasyon sistemi
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', mr: 2 }} />
                    Uygun fiyat politikası
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', mr: 2 }} />
                    Şehrin merkezi konumu
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                height: '100%',
                borderRadius: 3,
                borderTop: '5px solid #4CAF50',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom fontWeight="bold" color="primary">
                Vizyonumuz
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Box sx={{ 
                  width: '100%', 
                  height: 3, 
                  bgcolor: 'rgba(76,175,80,0.2)', 
                  alignSelf: 'center',
                  borderRadius: 3
                }} />
              </Box>
              
              <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8 }}>
                <strong>Futbol tutkunları için</strong> erişilebilir, kaliteli ve modern tesisler sunarak toplum sağlığına katkı sağlamak ve Elazığ'ın en sevilen halı saha tesisi olmak.
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8 }}>
                Tesislerimizin çevreye duyarlı ve sürdürülebilir olması, en son teknoloji ile donatılması ve her yaş grubuna hitap eden spor aktiviteleri sunması önceliğimizdir.
              </Typography>
              
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>Sporium 23</strong> olarak, halı saha kültürünün Elazığ'da gelişmesine öncülük etmek ve spor faaliyetlerinin yaygınlaşmasına katkıda bulunmak istiyoruz.
              </Typography>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <SportsSoccer sx={{ fontSize: 50, color: 'rgba(76,175,80,0.2)' }} />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                height: '100%',
                borderRadius: 3,
                borderTop: '5px solid #2196F3',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom fontWeight="bold" color="secondary">
                Misyonumuz
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Box sx={{ 
                  width: '100%', 
                  height: 3, 
                  bgcolor: 'rgba(33,150,243,0.2)', 
                  alignSelf: 'center',
                  borderRadius: 3
                }} />
              </Box>
              
              <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8 }}>
                <strong>Müşterilerimize en iyi halı saha deneyimini sunmak</strong>, sporu teşvik etmek ve sosyal etkileşimi artırmak için profesyonel hizmet standartları oluşturmak.
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8 }}>
                Her ziyaretçinin memnuniyetle ayrıldığı, güvenli, temiz ve keyifli bir ortam sunarak, spor yapmanın mutluluğunu ve sağlığını topluma yaymak için çalışıyoruz.
              </Typography>
              
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                <strong>Amacımız</strong>, futbol severlere unutulmaz anlar yaşatmak ve her yaştan insanın spor yapabileceği bir ortam oluşturmaktır.
              </Typography>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <EmojiEvents sx={{ fontSize: 50, color: 'rgba(33,150,243,0.2)' }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Tesis Özellikleri */}        <Box sx={{ mb: 8 }}>          <Typography             variant="h4"             component="h2"             gutterBottom             fontWeight="bold"             textAlign="center"            color="primary"            sx={{ mb: 4 }}          >            Tesis Özelliklerimiz          </Typography>                    <Grid container spacing={3}>            {facilities.map((facility, index) => (              <Grid item xs={12} sm={6} md={4} key={index}>                <Paper                   elevation={2}                   sx={{                     p: 3,                     height: '100%',                     borderRadius: 3,                    transition: 'transform 0.3s, box-shadow 0.3s',                    '&:hover': {                      transform: 'translateY(-10px)',                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'                    }                  }}                >                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', textAlign: 'center' }}>                    <Avatar                       sx={{                         width: 70,                         height: 70,                         mb: 2,                         bgcolor: 'primary.main',                        boxShadow: '0 4px 14px rgba(76,175,80,0.4)'                      }}                    >                      {facility.icon}                    </Avatar>                    <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">                      {facility.title}                    </Typography>                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>                      {facility.description}                    </Typography>                  </Box>                </Paper>              </Grid>            ))}          </Grid>        </Box>                {/* Rakamlarla Sporyum */}        <Paper           elevation={2}           sx={{             p: 4,             mb: 8,             borderRadius: 3,            backgroundImage: 'linear-gradient(to right, rgba(76, 175, 80, 0.9), rgba(33, 150, 243, 0.9))',            color: 'white',            position: 'relative',            overflow: 'hidden'          }}        >          <Box             sx={{               position: 'absolute',               top: 0,               left: 0,               right: 0,               bottom: 0,              backgroundImage: 'url(https://images.unsplash.com/photo-1540379708242-14a809bef941?auto=format&w=1000&q=80)',              backgroundSize: 'cover',              backgroundPosition: 'center',              opacity: 0.2,              zIndex: 0            }}          />                    <Box sx={{ position: 'relative', zIndex: 1 }}>            <Typography               variant="h4"               component="h2"               gutterBottom               fontWeight="bold"               textAlign="center"              sx={{ mb: 4 }}            >              Rakamlarla Sporyum            </Typography>                        <Grid container spacing={3} justifyContent="center">              <Grid item xs={6} sm={3} textAlign="center">                <Box sx={{ mb: 1 }}>                  <SportsSoccer sx={{ fontSize: 50 }} />                </Box>                <Typography variant="h3" fontWeight="bold">10</Typography>                <Typography variant="body1">Halı Saha</Typography>              </Grid>                            <Grid item xs={6} sm={3} textAlign="center">                <Box sx={{ mb: 1 }}>                  <People sx={{ fontSize: 50 }} />                </Box>                <Typography variant="h3" fontWeight="bold">25.000+</Typography>                <Typography variant="body1">Mutlu Müşteri</Typography>              </Grid>                            <Grid item xs={6} sm={3} textAlign="center">                <Box sx={{ mb: 1 }}>                  <VerifiedUser sx={{ fontSize: 50 }} />                </Box>                <Typography variant="h3" fontWeight="bold">8</Typography>                <Typography variant="body1">Yıllık Deneyim</Typography>              </Grid>                            <Grid item xs={6} sm={3} textAlign="center">                <Box sx={{ mb: 1 }}>                  <EmojiEvents sx={{ fontSize: 50 }} />                </Box>                <Typography variant="h3" fontWeight="bold">150+</Typography>                <Typography variant="body1">Turnuva</Typography>              </Grid>            </Grid>          </Box>        </Paper>

        {/* Tarihçemiz */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            fontWeight="bold" 
            textAlign="center"
            color="primary"
            sx={{ mb: 4 }}
          >
            Tarihçemiz
          </Typography>
          
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ 
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: { xs: 19, sm: 39 },
                width: 2,
                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                zIndex: 0
              }
            }}>
              {historyEvents.map((event, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    position: 'relative', 
                    display: 'flex',
                    mb: index === historyEvents.length - 1 ? 0 : 4,
                    zIndex: 1
                  }}
                >
                  <Box 
                    sx={{ 
                      width: { xs: 40, sm: 80 }, 
                      height: { xs: 40, sm: 80 }, 
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: { xs: '1rem', sm: '1.5rem' },
                      flexShrink: 0,
                      boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)'
                    }}
                  >
                    {event.year}
                  </Box>
                  
                  <Box sx={{ ml: 3, mt: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold" color="primary">
                      {event.title}
                    </Typography>
                    <Typography variant="body1">
                      {event.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Ekibimiz */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            fontWeight="bold" 
            textAlign="center"
            color="primary"
            sx={{ mb: 4 }}
          >
            Ekibimiz
          </Typography>
          
          <Grid container spacing={3}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="240"
                    image={member.image}
                    alt={member.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {member.title}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

                {/* Tesislerimiz */}        <Box sx={{ mb: 8 }}>          <Typography             variant="h4"             component="h2"             gutterBottom             fontWeight="bold"             textAlign="center"            color="primary"            sx={{ mb: 4 }}          >            Tesislerimiz          </Typography>                    <Grid container spacing={4}>            {locations.map((location, index) => (              <Grid item xs={12} md={4} key={index}>                <Card                   sx={{                     borderRadius: 3,                    overflow: 'hidden',                    height: '100%',                    display: 'flex',                    flexDirection: 'column',                    boxShadow: 3,                    transition: 'transform 0.3s, box-shadow 0.3s',                    '&:hover': {                      transform: 'translateY(-10px)',                      boxShadow: '0 15px 30px rgba(0,0,0,0.15)'                    }                  }}                >                  <CardMedia                    component="img"                    height="200"                    image={location.image}                    alt={location.name}                  />                  <CardContent sx={{ flexGrow: 1 }}>                    <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">                      {location.name}                    </Typography>                    <List dense>                      <ListItem disableGutters>                        <ListItemAvatar>                          <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'primary.main' }}>                            <LocationOn />                          </Avatar>                        </ListItemAvatar>                        <ListItemText                           primary={location.address}                         />                      </ListItem>                      <ListItem disableGutters>                        <ListItemAvatar>                          <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'primary.main' }}>                            <Phone />                          </Avatar>                        </ListItemAvatar>                        <ListItemText primary={location.phone} />                      </ListItem>                    </List>                                        <Divider sx={{ my: 1.5 }} />                                        <Typography variant="subtitle2" color="primary" fontWeight="medium" gutterBottom>                      Özellikler:                    </Typography>                    <Box sx={{ mb: 2 }}>                      {location.features.map((feature, idx) => (                        <Typography key={idx} variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>                          <Box component="span" sx={{                             width: 6,                             height: 6,                             borderRadius: '50%',                             bgcolor: 'primary.main',                             display: 'inline-block',                            mr: 1.5                           }} />                          {feature}                        </Typography>                      ))}                    </Box>                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>                      <Button                         variant="contained"                         color="primary"                         sx={{ flexGrow: 1 }}                        endIcon={<ArrowForward />}                      >                        Rezervasyon                      </Button>                      <Button                         component={Link}                        href={location.maps}                        target="_blank"                        rel="noopener noreferrer"                        variant="outlined"                         color="primary"                        startIcon={<LocationOn />}                      >                        Harita                      </Button>                    </Box>                  </CardContent>                </Card>              </Grid>            ))}          </Grid>        </Box>                {/* Harita */}        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            fontWeight="bold" 
            textAlign="center"
            color="primary"
            sx={{ mb: 4 }}
          >
            Bizi Ziyaret Edin
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={3}
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 450,
                  position: 'relative'
                }}
              >
                <Box 
                  component="iframe"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3128.0133249292286!2d39.2298651!3d38.393053199999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4076c0c2a105028b%3A0xd50ef613a82661b0!2sSporium%2023%20Hal%C4%B1%20Saha!5e0!3m2!1str!2str!4v1686225933360!5m2!1str!2str"
                  sx={{ 
                    border: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: 'white',
                    p: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    maxWidth: {xs: '80%', sm: 350},
                    border: '2px solid #4CAF50'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                    SPORIUM 23 HALI SAHA
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <LocationOn color="primary" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                    <Box sx={{ lineHeight: 1.4 }}>
                      Cumhuriyet Mah. F. Ahmet Baba Bulvarı No:110, Tedaş Kavşağı Türk Telekom Arkası, Elazığ
                    </Box>
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone color="primary" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                    0424 247 7701 / 0555 732 6476
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<DirectionsCar />}
                    sx={{ mt: 1.5, borderRadius: 2 }}
                    component="a"
                    href="https://maps.app.goo.gl/wPQB4eqvV7bwWMDy9"
                    target="_blank"
                  >
                    Yol Tarifi Al
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  borderTop: '5px solid #4CAF50'
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom color="primary" fontWeight="bold">
                  Konum Bilgileri
                </Typography>
                <List>
                  <ListItem disableGutters sx={{ mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'primary.main' }}>
                        <LocationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Adres" 
                      secondary="Cumhuriyet Mah. F. Ahmet Baba Bulvarı No:110, Tedaş Kavşağı Türk Telekom Arkası, Elazığ"
                      primaryTypographyProps={{
                        fontWeight: 'bold',
                        color: 'primary'
                      }}
                      secondaryTypographyProps={{
                        style: { lineHeight: 1.4 }
                      }}
                    />
                  </ListItem>
                  <ListItem disableGutters sx={{ mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'primary.main' }}>
                        <Phone />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Telefon" 
                      secondary={
                        <>
                          <Box component="span" sx={{ display: 'block' }}>0424 247 7701</Box>
                          <Box component="span" sx={{ display: 'block' }}>0555 732 6476</Box>
                        </>
                      }
                      primaryTypographyProps={{
                        fontWeight: 'bold',
                        color: 'primary'
                      }}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'primary.main' }}>
                        <AccessTime />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Çalışma Saatleri" 
                      secondary={
                        <>
                          <Box component="span" sx={{ display: 'block', fontWeight: 'medium' }}>Hafta içi: 09:00 - 00:00</Box>
                          <Box component="span" sx={{ display: 'block', fontWeight: 'medium' }}>Hafta sonu: 09:00 - 01:00</Box>
                        </>
                      }
                      primaryTypographyProps={{
                        fontWeight: 'bold',
                        color: 'primary'
                      }}
                    />
                  </ListItem>
                </List>
                <Box sx={{ flexGrow: 1 }} />
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  fullWidth
                  sx={{ 
                    mt: 3, 
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  Rezervasyon Yap
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* İletişim */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            backgroundColor: 'primary.light',
            backgroundImage: 'linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))'
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h2" gutterBottom fontWeight="bold" color="primary">
                Bizimle İletişime Geçin
              </Typography>
                            <Typography variant="body1" paragraph>                Sporium 23 Halı Saha tesisleri hakkında daha fazla bilgi almak, rezervasyon yapmak veya önerilerinizi iletmek için bizimle iletişime geçebilirsiniz.
              </Typography>
                            <Grid container spacing={3}>                <Grid item xs={12} sm={6}>                  <Box sx={{ display: 'flex', mb: 2 }}>                    <Phone color="primary" sx={{ mr: 2 }} />                    <Typography>0424 247 7701 / 0555 732 6476</Typography>                  </Box>                  <Box sx={{ display: 'flex', mb: 2 }}>                    <Email color="primary" sx={{ mr: 2 }} />                    <Typography>info@sporium23.com</Typography>                  </Box>                  <Box sx={{ display: 'flex' }}>                    <LocationOn color="primary" sx={{ mr: 2 }} />                    <Typography>Cumhuriyet Mah. F. Ahmet Baba Bulvarı No:110, Tedaş Kavşağı Türk Telekom Arkası, Elazığ</Typography>                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Bizi sosyal medyada takip edin:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <IconButton 
                      color="primary" 
                      sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.2)'
                        }
                      }}
                    >
                      <Facebook />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.2)'
                        }
                      }}
                    >
                      <Twitter />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.2)'
                        }
                      }}
                    >
                      <Instagram />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                fullWidth
                sx={{ 
                  py: 2, 
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  boxShadow: 5
                }}
              >
                Bize Ulaşın
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                fullWidth
                sx={{ 
                  py: 2, 
                  mt: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3
                }}
              >
                Rezervasyon Yap
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage; 