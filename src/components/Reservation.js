import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Card, CardContent,
  Grid, Button, TextField, FormControl, InputLabel,
  Select, MenuItem, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel, Alert, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Badge, CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  SportsSoccer, Place, AccessTime, Group,
  EventNote, Check, Close, ArrowForward, Phone,
  Email, Info, Star, StarBorder, Refresh as RefreshIcon, Edit
} from '@mui/icons-material';
import { tr } from 'date-fns/locale';
import axios from 'axios';
import { format, addDays } from 'date-fns';

// Axios yapılandırması
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = false; // CORS sorunları için false olarak ayarla

// Sabit Sporyum 23 halı saha bilgisi
const sporyum23 = {
  id: 'sporyum23',
  name: 'Sporyum 23',
  location: 'Ümraniye, İstanbul',
  rating: 4.7,
  price: 450,
  image: 'S',
  features: ['Duş', 'Soyunma Odası', 'Otopark', 'Kafeterya'],
  contact: '0555 123 4567',
  email: 'info@sporyum23.com',
  description: 'Sporyum 23 Halı Saha Tesisi',
  workingHours: '09:00 - 23:00',
  fields: [
    { id: 1, name: 'Saha 1', size: '30x50m', indoor: false },
    { id: 2, name: 'Saha 2', size: '25x45m', indoor: false },
    { id: 3, name: 'Saha 3', size: '25x45m', indoor: true }
  ]
};

// Mock rezervasyon verileri
const mockReservations = [
  {
    id: 'res1',
    date: format(new Date(), 'dd.MM.yyyy'),
    startTime: '10:00',
    endTime: '11:00',
    user: {
      firstName: 'Örnek',
      lastName: 'Kullanıcı',
      phone: '0555 123 4567'
    },
    status: 'onaylandı',
    price: 450,
    field: 1
  },
  {
    id: 'res2',
    date: format(addDays(new Date(), 1), 'dd.MM.yyyy'),
    startTime: '18:00',
    endTime: '19:00',
    user: {
      firstName: 'Ali',
      lastName: 'Yılmaz',
      phone: '0532 987 6543'
    },
    status: 'beklemede',
    price: 450,
    field: 2
  }
];

function Reservation() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedField, setSelectedField] = useState(1); // Varsayılan olarak Saha 1
  const [playerCount, setPlayerCount] = useState(10);
  const [note, setNote] = useState('');
  const [customerName, setCustomerName] = useState(''); // Müşteri adı
  const [customerPhone, setCustomerPhone] = useState(''); // Müşteri telefonu
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);

  const steps = ['Tarih Seçimi', 'Saat Seçimi', 'Detaylar', 'Onay'];

  // Sporyum 23 için boş saatleri getir
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDate, selectedField]); // Saha değişikliğinde de güncelle

  // Tüm rezervasyonları getir - sayfa yüklendiğinde çalışacak
  useEffect(() => {
    // İlk yüklenmede rezervasyonları getir
    fetchReservations().then(success => {
      // Normal API başarısız olursa veya veri gelmezse, doğrudan MongoDB'den al
      if (!success) {
        setTimeout(() => {
          console.log('Normal API\'den veri gelmedi veya başarısız oldu, doğrudan MongoDB\'ye bağlanılıyor...');
          fetchReservationsDirectly();
        }, 1000);
      }
    });
    
    // Her 30 saniyede bir rezervasyonları otomatik olarak yenile
    const intervalId = setInterval(() => {
      // Önce normal API'yi dene
      fetchReservations().then(success => {
        // Veri gelmezse MongoDB'den almayı dene
        if (!success) {
          fetchReservationsDirectly();
        }
      });
    }, 30000);
    
    // Component unmount olduğunda interval'i temizle
    return () => clearInterval(intervalId);
  }, []);

  const fetchAvailableTimeSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log(`Boş saatler için istek yapılıyor: /api/reservations/available-slots?venueId=${sporyum23.id}&date=${formattedDate}&field=${selectedField}`);
      
      // API'den boş saatleri getir
      const response = await axios.get('/api/reservations/available-slots', {
        params: {
          venueId: sporyum23.id,
          date: formattedDate,
          field: selectedField // Seçilen saha numarası
        },
        timeout: 5000 // 5 saniye timeout ekle
      });
      
      console.log('API yanıtı:', response.data);
      
      if (response.data && response.data.timeSlots) {
        setAvailableTimeSlots(response.data.timeSlots);
      } else {
        console.log('API yanıtında timeSlots bulunamadı, varsayılan saatler oluşturuluyor');
        createDefaultTimeSlots();
      }
      
      // Admin paneli için tüm rezervasyonları getir
      fetchReservations();
    } catch (err) {
      console.error('Boş saatleri getirme hatası:', err);
      
      // Hata detayını göster
      const errorMessage = err.response?.data?.message || 'Boş saatler getirilirken bir hata oluştu.';
      setError(`${errorMessage} Lütfen tekrar deneyin.`);
      
      // Hata durumunda varsayılan saatler oluştur
      createDefaultTimeSlots();
    } finally {
      setLoading(false);
    }
  };
  
  // Varsayılan zaman dilimlerini oluştur
  const createDefaultTimeSlots = () => {
    const workingHours = {
      open: 9, // 09:00
      close: 23 // 23:00
    };
    
    // Boş saatleri oluştur
    const slots = [];
    for (let hour = workingHours.open; hour < workingHours.close; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      slots.push({
        startTime,
        endTime,
        available: true
      });
    }
    
    setAvailableTimeSlots(slots);
  };

  // Direkt MongoDB'den rezervasyonları getiren fonksiyon
  const fetchReservationsDirectly = async () => {
    try {
      console.log('Direkt MongoDB\'den rezervasyonlar getiriliyor...');
      setLoading(true);
      setError(null);
      
      // Rezervasyon modelini direkt MongoDB'den al
      const reservations = await axios.get('/api/reservations/direct-mongodb');
      
      if (reservations.data && Array.isArray(reservations.data)) {
        console.log('MongoDB\'den direkt', reservations.data.length, 'rezervasyon alındı');
        
        // Dönüşüm yap
        const formattedReservations = reservations.data.map(res => ({
          id: res._id,
          date: format(new Date(res.date), 'dd.MM.yyyy'),
          startTime: res.startTime,
          endTime: res.endTime,
          user: {
            firstName: res.user?.firstName || res.user?.username || 'Misafir',
            lastName: res.user?.lastName || '',
            phone: res.user?.phone || ''
          },
          status: res.status || 'beklemede',
          price: res.price,
          field: res.field || 1
        }));
        
        setReservations(formattedReservations);
      }
    } catch (err) {
      console.error('Direkt MongoDB rezervasyon getirme hatası:', err);
      setError('MongoDB\'den rezervasyonlar alınamadı');
    } finally {
      setLoading(false);
    }
  };

  // Tüm rezervasyonları API'den getir
  const fetchReservations = async () => {
    try {
      console.log('Sporyum 23 rezervasyonları getiriliyor');
      setLoading(true);
      setError(null); // Hata durumunu sıfırla
      
      // API isteğini daha fazla loglama ile gönder
      console.log('API isteği başlatılıyor: /api/reservations/venue/sporyum23');
      const response = await axios.get('/api/reservations/venue/sporyum23', {
        timeout: 15000 // Timeout süresini 15 saniyeye çıkar
      });
      
      console.log('API yanıtı alındı:', response.status, response.statusText);
      console.log('Yanıt verileri:', response.data);
      
      if (response.data && response.data.reservations) {
        console.log('Rezervasyonlar başarıyla alındı:', response.data.reservations.length, 'adet rezervasyon');
        
        if (response.data.reservations.length === 0) {
          console.log('Rezervasyon listesi boş. Kayıtlı rezervasyon yok.');
          setReservations([]);
          setLoading(false);
          return false;
        }
        
        // API'den gelen rezervasyonları formatlayarak state'e kaydet
        const formattedReservations = response.data.reservations.map(res => {
          console.log('Rezervasyon veri yapısı:', res);
          return {
            id: res._id,
            date: format(new Date(res.date), 'dd.MM.yyyy'),
            startTime: res.startTime,
            endTime: res.endTime,
            user: {
              firstName: res.customerName || res.user?.firstName || res.user?.username || 'Misafir',
              lastName: '',
              phone: res.customerPhone || res.user?.phone || 'Telefon Bilgisi Yok',
              email: res.user?.email || ''
            },
            customerName: res.customerName || 'Misafir',
            customerPhone: res.customerPhone || 'Telefon Bilgisi Yok',
            status: res.status || 'beklemede',
            price: res.price,
            field: res.field || 1,
            createdAt: res.createdAt ? new Date(res.createdAt) : new Date(),
            venue: res.venue?.name || 'Sporyum 23'
          };
        });
        
        // En son oluşturulan rezervasyonlar üstte olacak şekilde sırala
        const sortedReservations = formattedReservations.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        setReservations(sortedReservations);
        console.log('Rezervasyonlar state\'e kaydedildi:', sortedReservations.length, 'adet');
        return true;
      } else {
        console.log('Rezervasyon verisi bulunamadı veya yanıt yapısı beklendiği gibi değil');
        console.log('Tam yanıt:', response.data);
        setReservations([]);
        return false;
      }
    } catch (err) {
      console.error('Rezervasyonları getirme hatası:', err);
      if (err.response) {
        console.error('Hata yanıtı:', err.response.status, err.response.statusText, err.response.data);
      } else if (err.request) {
        console.error('İstek gönderildi ancak yanıt alınamadı.');
      } else {
        console.error('İstek ayarlamada hata:', err.message);
      }
      setError('Rezervasyonları getirirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
      // Hata durumunda boş dizi ata
      setReservations([]);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!isStepValid()) {
      return; // Geçerli adım doğrulanmadıysa ilerleme
    }
    
    if (activeStep === steps.length - 1) {
      // Son adımdaysak ve seçimler tamamsa onay dialogunu göster
      if (selectedDate && selectedTime) {
      setShowConfirmDialog(true);
      } else {
        setError('Lütfen tarih ve saat seçimini tamamlayın.');
      }
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    
    try {
      // Seçilen zaman dilimini kontrol et
      if (!selectedTime) {
        throw new Error('Lütfen bir saat seçin');
      }
      
      // Müşteri adı ve telefon kontrolü
      if (!customerName.trim()) {
        throw new Error('Lütfen isim ve soyisim giriniz');
      }
      
      if (!customerPhone.trim()) {
        throw new Error('Lütfen telefon numarası giriniz');
      }
      
      // Bitiş saatini hesapla
      const endTime = `${(parseInt(selectedTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;
      
      const reservationData = {
        venue: sporyum23.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        endTime: endTime,
        price: sporyum23.price,
        field: selectedField, // Seçilen saha numarası
        customerName: customerName.trim(), // Müşteri adı
        customerPhone: customerPhone.trim(), // Telefon numarası
        participants: [], // Katılımcılar (boş array)
        notes: note,
        status: 'beklemede'
      };
      
      console.log('Rezervasyon gönderiliyor:', reservationData);
      
      // API'ye rezervasyon gönder
      const response = await axios.post('/api/reservations', reservationData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 saniye timeout ekle
      });
      
      console.log('Rezervasyon başarıyla oluşturuldu:', response.data);
      
      // Başarılı rezervasyon
      setShowSuccessDialog(true);
      
      // Boş saatleri güncelle
      fetchAvailableTimeSlots();
      
      // Tüm rezervasyonları güncelle
      fetchReservations();
      
      // Sayfa yenileme yerine state'i temizle
      setActiveStep(0);
      setSelectedTime(null);
      setNote('');
      setCustomerName('');
      setCustomerPhone('');
      setSelectedField(1);
    } catch (err) {
      console.error('Rezervasyon oluşturma hatası:', err);
      // Hata mesajını daha detaylı göster
      const errorMsg = err.response?.data?.message || err.message || 'Rezervasyon oluşturulurken bir hata oluştu.';
      setError(`Rezervasyon hatası: ${errorMsg}. Lütfen tekrar deneyin.`);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return selectedDate !== null;
      case 1:
        return selectedTime !== null;
      case 2:
        return playerCount >= 10 && playerCount <= 14 && 
          customerName.trim() !== '' && customerPhone.trim() !== '';
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#4CAF50',
                          width: 56,
                          height: 56,
                          mr: 2
                        }}
                      >
                    {sporyum23.image}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {sporyum23.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                      {sporyum23.location}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        star <= Math.floor(sporyum23.rating) ? 
                          <Star key={star} fontSize="small" sx={{ color: '#FFD700' }} /> : 
                          <StarBorder key={star} fontSize="small" sx={{ color: '#FFD700' }} />
                      ))}
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {sporyum23.rating}
                        </Typography>
                    </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    {sporyum23.price} ₺
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        / saat
                      </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone fontSize="small" sx={{ color: '#4CAF50', mr: 1 }} />
                      <Typography variant="body2">{sporyum23.contact}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email fontSize="small" sx={{ color: '#4CAF50', mr: 1 }} />
                      <Typography variant="body2">{sporyum23.email}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime fontSize="small" sx={{ color: '#4CAF50', mr: 1 }} />
                      <Typography variant="body2">Çalışma Saatleri: {sporyum23.workingHours}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Info fontSize="small" sx={{ color: '#4CAF50', mr: 1 }} />
                      <Typography variant="body2">Özellikler: {sporyum23.features.join(', ')}</Typography>
                    </Box>
                  </Grid>
                </Grid>
                  </CardContent>
                </Card>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                <DatePicker
                label="Rezervasyon Tarihi Seçin"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={new Date()}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
            </LocalizationProvider>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {format(selectedDate, 'dd MMMM yyyy, EEEE', { locale: tr })} Tarihi İçin Müsait Saatler
            </Typography>
            
            {/* Saha seçimi */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Saha Seçimi</InputLabel>
              <Select
                value={selectedField}
                label="Saha Seçimi"
                onChange={(e) => setSelectedField(e.target.value)}
              >
                {sporyum23.fields.map((field) => (
                  <MenuItem key={field.id} value={field.id}>
                    {field.name} ({field.indoor ? 'Kapalı' : 'Açık'}) - {field.size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {loading && <Typography>Müsait saatler yükleniyor...</Typography>}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {!loading && !error && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {availableTimeSlots.map((slot, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Button
                      variant={selectedTime === slot.startTime ? "contained" : "outlined"}
                      color={slot.available ? "primary" : "error"}
                      disabled={!slot.available}
                      fullWidth
                      onClick={() => setSelectedTime(slot.startTime)}
                      sx={{ 
                        height: '60px',
                        borderRadius: 2,
                        fontWeight: 'bold'
                      }}
                    >
                      {slot.startTime} - {slot.endTime}
                      {!slot.available && <Close fontSize="small" sx={{ ml: 1 }} />}
                    </Button>
              </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Kişisel Bilgiler
              </Typography>
              
              <TextField
                label="İsim Soyisim"
                fullWidth
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Rezervasyon sahibinin adı soyadı"
                required
                sx={{ mb: 2 }}
                error={!customerName.trim() && activeStep === 2}
                helperText={!customerName.trim() && activeStep === 2 ? "İsim ve soyisim gereklidir" : ""}
              />
              
              <TextField
                label="Telefon Numarası"
                fullWidth
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="05XX XXX XXXX"
                required
                sx={{ mb: 3 }}
                error={!customerPhone.trim() && activeStep === 2}
                helperText={!customerPhone.trim() && activeStep === 2 ? "Telefon numarası gereklidir" : ""}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Oyuncu Sayısı"
                type="number"
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                InputProps={{ inputProps: { min: 10, max: 14 } }}
                helperText="Minimum 10, maksimum 14 oyuncu"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Not"
                multiline
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Eklemek istediğiniz notlar..."
              />
            </Grid>
          </Grid>
        );

      case 3:
        // Son adımda tarih ve saat seçilmiş olmalı
        if (!selectedDate || !selectedTime) {
          return (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Lütfen tarih ve saat seçimini tamamlayın.
            </Alert>
          );
        }
        
        return (
          <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Rezervasyon Özeti
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography>
                      <strong>{customerName}</strong> - {customerPhone}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Place sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography>
                      {sporyum23.name} - {sporyum23.fields.find(f => f.id === selectedField).name}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventNote sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography>
                      {format(selectedDate, 'dd MMMM yyyy, EEEE', { locale: tr })}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography>
                      {selectedTime && `${selectedTime} - ${parseInt(selectedTime.split(':')[0]) + 1}:00`}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography>
                      {playerCount} Oyuncu
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <SportsSoccer sx={{ color: '#4CAF50', mr: 1 }} />
                    <Box>
                      <Typography fontWeight="bold">
                        Toplam Ücret: {sporyum23.price} ₺
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ödeme saha girişinde yapılacaktır.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {note && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Not:</strong> {note}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Admin paneli için rezervasyon yönetim tablosu
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  const handleStatusChange = async () => {
    if (!selectedReservation || !newStatus) return;
    
    try {
      console.log(`Rezervasyon durumu güncelleniyor: ${selectedReservation.id} -> ${newStatus}`);
      setLoading(true);
      
      // API isteği ile rezervasyon durumunu güncelle
      await axios.patch(`/api/reservations/${selectedReservation.id}/status`, {
        status: newStatus
      });
      
      // State'deki rezervasyon listesini güncelle - backend'e gitmeden önce UI'ı güncelle
      const updatedReservations = reservations.map(r => 
        r.id === selectedReservation.id 
          ? {...r, status: newStatus} 
          : r
      );
      setReservations(updatedReservations);
      
      // Başarılı güncelleme mesajı
      setError(null);
      
      // Boş saatleri de güncelle çünkü durum değişikliği müsaitlik durumunu etkileyebilir
      if (selectedDate) {
        fetchAvailableTimeSlots();
      }
      
      // Dialog'u kapat
      setStatusDialogOpen(false);
      setSelectedReservation(null);
      setNewStatus('');
      
      // 1 saniye sonra tüm rezervasyonları yeniden yükle
      setTimeout(() => {
        fetchReservations();
      }, 1000);
      
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      setError('Rezervasyon durumu güncellenirken bir hata oluştu: ' + 
        (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const openStatusDialog = (reservation, initialStatus) => {
    setSelectedReservation(reservation);
    setNewStatus(initialStatus || reservation.status || 'beklemede');
    setStatusDialogOpen(true);
  };

  const getStatusChipColor = (status) => {
    switch(status) {
      case 'onaylandı': return 'success';
      case 'beklemede': return 'warning';
      case 'iptal edildi': return 'error';
      case 'tamamlandı': return 'info';
      default: return 'default';
    }
  };

  const renderAdminPanel = () => {
    return (
      <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="h5" gutterBottom>
          Halı Saha Yönetim Paneli
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Rezervasyon Yönetimi {reservations.length > 0 && `(${reservations.length} rezervasyon)`}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />} 
            onClick={fetchReservations}
            disabled={loading}
            color="primary"
            size="small"
          >
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TableContainer component={Paper} sx={{ maxHeight: 500, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Müşteri</TableCell>
                <TableCell>İletişim</TableCell>
                <TableCell>Saha</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Saat</TableCell>
                <TableCell>Tutar</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Rezervasyonlar yükleniyor...
                  </TableCell>
                </TableRow>
              ) : reservations.length > 0 ? (
                reservations.map((reservation) => (
                  <TableRow key={reservation.id} 
                    sx={{ 
                      bgcolor: 
                        reservation.status === 'beklemede' ? 'rgba(255, 235, 59, 0.1)' : 
                        reservation.status === 'onaylandı' ? 'rgba(76, 175, 80, 0.1)' : 
                        reservation.status === 'iptal edildi' ? 'rgba(244, 67, 54, 0.1)' : 
                        'transparent' 
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                          {reservation.customerName?.charAt(0) || 'M'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {reservation.customerName || reservation.user?.firstName || 'Misafir'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{reservation.customerPhone || reservation.user?.phone || 'Belirtilmemiş'}</Typography>
                    </TableCell>
                    <TableCell>Saha {reservation.field || 1}</TableCell>
                    <TableCell>{reservation.date}</TableCell>
                    <TableCell>{reservation.startTime} - {reservation.endTime}</TableCell>
                    <TableCell>{reservation.price} ₺</TableCell>
                    <TableCell>
                      <Chip 
                        label={reservation.status === 'onaylandı' ? 'Onaylandı' : 
                               reservation.status === 'iptal edildi' ? 'İptal Edildi' : 
                               reservation.status === 'tamamlandı' ? 'Tamamlandı' : 'Onay Bekliyor'} 
                        color={getStatusChipColor(reservation.status)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="success" 
                        onClick={() => openStatusDialog(reservation, 'onaylandı')}
                        title="Onayla"
                        disabled={reservation.status === 'onaylandı' || reservation.status === 'iptal edildi'}
                      >
                        <Check />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => openStatusDialog(reservation, 'iptal edildi')}
                        title="İptal Et"
                        disabled={reservation.status === 'iptal edildi'}
                      >
                        <Close />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => openStatusDialog(reservation, reservation.status)}
                        title="Durumu Değiştir"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Henüz rezervasyon bulunmamaktadır.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Durum değiştirme dialog'u */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
          <DialogTitle>Rezervasyon Durumu Değiştir</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 300, mt: 2 }}>
              {selectedReservation && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Rezervasyon Bilgileri
                  </Typography>
                  <Typography variant="body2">
                    <strong>Müşteri:</strong> {selectedReservation.customerName || selectedReservation.user?.firstName || 'Misafir'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>İletişim:</strong> {selectedReservation.customerPhone || selectedReservation.user?.phone || 'Belirtilmemiş'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tarih:</strong> {selectedReservation.date}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Saat:</strong> {selectedReservation.startTime} - {selectedReservation.endTime}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Saha:</strong> Saha {selectedReservation.field || 1}
                  </Typography>
                </Box>
              )}
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="beklemede">Beklemede</MenuItem>
                  <MenuItem value="onaylandı">Onaylandı</MenuItem>
                  <MenuItem value="iptal edildi">İptal Edildi</MenuItem>
                  <MenuItem value="tamamlandı">Tamamlandı</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>İptal</Button>
            <Button 
              onClick={handleStatusChange} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Saha Rezervasyonu
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {renderStepContent()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
          disabled={activeStep === 0}
          onClick={handleBack}
            variant="outlined"
          >
            Geri
          </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={!isStepValid() || loading}
          endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
        >
          {activeStep === steps.length - 1 ? 'Rezervasyonu Tamamla' : 'Devam Et'}
        </Button>
      </Box>
      
      {/* Admin paneli */}
      {renderAdminPanel()}

      {/* Onay Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Rezervasyonu Onaylayın</DialogTitle>
        <DialogContent>
          <Typography>
            {sporyum23.name} için {format(selectedDate, 'dd MMMM yyyy', { locale: tr })} tarihinde {selectedTime && `${selectedTime} - ${parseInt(selectedTime.split(':')[0]) + 1}:00`} saatleri arasında rezervasyon yapmak istediğinizi onaylıyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>İptal</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary" disabled={loading}>
            {loading ? 'İşleniyor...' : 'Onaylıyorum'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Başarı Dialog */}
      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
        <DialogTitle>Rezervasyon Başarılı!</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Rezervasyonunuz başarıyla oluşturuldu. Rezervasyon detayları aşağıdadır:
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Saha:</strong> {sporyum23.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Tarih:</strong> {selectedDate && format(selectedDate, 'dd MMMM yyyy, EEEE', { locale: tr })}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Saat:</strong> {selectedTime && `${selectedTime} - ${parseInt(selectedTime.split(':')[0]) + 1}:00`}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Durum:</strong> 
            </Typography>
            <Chip size="small" label="Onay Bekliyor" color="warning" />
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Rezervasyonunuz admin onayı bekliyor. Onaylandıktan sonra kesinleşecektir.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowSuccessDialog(false);
            setActiveStep(0);
            setSelectedTime(null);
            setNote('');
            // Rezervasyonları tekrar yükle
            fetchReservations();
          }} variant="contained" color="primary">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Reservation;
