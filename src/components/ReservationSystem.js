import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, IconButton,
  TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, Grid, Chip,
  Alert, CircularProgress, Tabs, Tab, Card, CardContent
} from '@mui/material';
import { 
  Delete, Edit, Check, Close, Search, 
  Refresh, CalendarMonth, AccessTime, Person
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { tr } from 'date-fns/locale';
import { format } from 'date-fns';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

// Rezervasyon durumları
const reservationStatuses = [
  { value: 'beklemede', label: 'Beklemede', color: 'warning' },
  { value: 'onaylandı', label: 'Onaylandı', color: 'success' },
  { value: 'iptal edildi', label: 'İptal Edildi', color: 'error' },
  { value: 'tamamlandı', label: 'Tamamlandı', color: 'info' }
];

// Sabit saha bilgileri
const fields = [
  { id: 1, name: 'Saha 1' },
  { id: 2, name: 'Saha 2' },
  { id: 3, name: 'Saha 3' }
];

// Mock rezervasyon verileri
const mockReservations = [
  {
    id: '1',
    date: '18.05.2023',
    startTime: '18:00',
    endTime: '19:00',
    field: 1,
    user: { firstName: 'Ahmet', lastName: 'Yılmaz', phone: '0532 123 4567' },
    status: 'onaylandı',
    price: 350
  },
  {
    id: '2',
    date: '18.05.2023',
    startTime: '19:00',
    endTime: '20:00',
    field: 2,
    user: { firstName: 'Mehmet', lastName: 'Demir', phone: '0533 234 5678' },
    status: 'onaylandı',
    price: 350
  },
  {
    id: '3',
    date: '18.05.2023',
    startTime: '20:00',
    endTime: '21:00',
    field: 1,
    user: { firstName: 'Ali', lastName: 'Kaya', phone: '0534 345 6789' },
    status: 'onaylandı',
    price: 400
  },
  {
    id: '4',
    date: '19.05.2023',
    startTime: '18:00',
    endTime: '19:00',
    field: 3,
    user: { firstName: 'Kerem', lastName: 'Yıldız', phone: '0535 456 7890' },
    status: 'beklemede',
    price: 350
  },
  {
    id: '5',
    date: '19.05.2023',
    startTime: '21:00',
    endTime: '22:00',
    field: 2,
    user: { firstName: 'Ozan', lastName: 'Şimşek', phone: '0536 567 8901' },
    status: 'onaylandı',
    price: 300
  },
  {
    id: '6',
    date: '20.05.2023',
    startTime: '17:00',
    endTime: '18:00',
    field: 1,
    user: { firstName: 'Berk', lastName: 'Yılmaz', phone: '0537 678 9012' },
    status: 'iptal edildi',
    price: 300
  },
  {
    id: '7',
    date: '20.05.2023',
    startTime: '19:00',
    endTime: '20:00',
    field: 3,
    user: { firstName: 'Can', lastName: 'Demir', phone: '0538 789 0123' },
    status: 'onaylandı',
    price: 350
  },
  {
    id: '8',
    date: '21.05.2023',
    startTime: '18:00',
    endTime: '19:00',
    field: 2,
    user: { firstName: 'Eren', lastName: 'Kaya', phone: '0539 890 1234' },
    status: 'beklemede',
    price: 350
  },
  {
    id: '9',
    date: '21.05.2023',
    startTime: '20:00',
    endTime: '21:00',
    field: 1,
    user: { firstName: 'Deniz', lastName: 'Yıldız', phone: '0540 901 2345' },
    status: 'onaylandı',
    price: 400
  }
];

function ReservationSystem() {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Debug için kullanıcı bilgilerini konsola yazdır
  console.log('ReservationSystem - Current user:', user);
  console.log('ReservationSystem - User role:', user?.role);
  console.log('ReservationSystem - User username:', user?.username);
  
  // localStorage'dan da kontrol et
  const storedUser = localStorage.getItem('user');
  const parsedStoredUser = storedUser ? JSON.parse(storedUser) : null;
  console.log('ReservationSystem - Stored user:', parsedStoredUser);

  // Admin kontrolü - sadece admin kullanıcılar yönetim panelini görebilir
  // Hem AuthContext'ten hem de localStorage'dan kontrol et
  const isAdmin = false; // Geçici olarak false yap - hiç kimse göremeyecek
  // const isAdmin = (user && (user.role === 'admin' || user.username === 'admin')) || 
  //                 (parsedStoredUser && (parsedStoredUser.role === 'admin' || parsedStoredUser.username === 'admin'));
  console.log('ReservationSystem - Is admin:', isAdmin);

  // Rezervasyonları yükle
  useEffect(() => {
    fetchReservations();
  }, []);

  // Filtreleri uygula
  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, dateFilter, statusFilter, fieldFilter]);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      // API'den rezervasyonları getir
      const response = await axios.get('/api/reservations/all');
      
      if (response.data && response.data.length > 0) {
        // API'den gelen rezervasyonları formatlayarak state'e kaydet
        const formattedReservations = response.data.map(res => ({
          id: res._id,
          date: format(new Date(res.date), 'dd.MM.yyyy'),
          startTime: res.startTime,
          endTime: res.endTime,
          user: {
            firstName: res.user?.firstName || res.user?.username || 'Misafir',
            lastName: res.user?.lastName || '',
            phone: res.user?.phone || ''
          },
          status: res.status,
          price: res.price,
          field: res.field || Math.floor(Math.random() * 3) + 1 // Eğer field yoksa rastgele atama
        }));
        
        setReservations(formattedReservations);
      } else {
        console.log('Rezervasyon verisi bulunamadı');
        setReservations(mockReservations); // Geçici olarak mock veri kullan
      }
    } catch (err) {
      console.error('Rezervasyonları getirme hatası:', err);
      setError('Rezervasyonlar yüklenirken bir hata oluştu.');
      setReservations(mockReservations); // Hata durumunda mock veri kullan
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];
    
    // Arama terimine göre filtrele
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(res => 
        res.user.firstName.toLowerCase().includes(term) ||
        res.user.lastName.toLowerCase().includes(term) ||
        res.user.phone.includes(term)
      );
    }
    
    // Tarihe göre filtrele
    if (dateFilter) {
      const formattedDate = format(dateFilter, 'dd.MM.yyyy');
      filtered = filtered.filter(res => res.date === formattedDate);
    }
    
    // Duruma göre filtrele
    if (statusFilter) {
      filtered = filtered.filter(res => res.status === statusFilter);
    }
    
    // Sahaya göre filtrele
    if (fieldFilter) {
      filtered = filtered.filter(res => res.field === parseInt(fieldFilter));
    }
    
    setFilteredReservations(filtered);
  };

  const handleEditReservation = (reservation) => {
    setCurrentReservation(reservation);
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      // API'ye durum güncelleme isteği gönder
      await axios.patch(`/api/reservations/${id}/status`, { status: newStatus });
      
      // Rezervasyonları yeniden yükle
      fetchReservations();
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
      setError('Rezervasyon durumu güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!currentReservation) return;
    
    setLoading(true);
    try {
      // API'ye güncelleme isteği gönder
      await axios.put(`/api/reservations/${currentReservation.id}`, currentReservation);
      
      // Rezervasyonları yeniden yükle
      fetchReservations();
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Rezervasyon güncelleme hatası:', err);
      setError('Rezervasyon güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) {
      return;
    }
    
    setLoading(true);
    try {
      // API'ye silme isteği gönder
      await axios.delete(`/api/reservations/${id}`);
      
      // Rezervasyonları yeniden yükle
      fetchReservations();
    } catch (err) {
      console.error('Rezervasyon silme hatası:', err);
      setError('Rezervasyon silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderReservationsTable = () => {
    if (loading && reservations.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    if (filteredReservations.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Bu kriterlere uygun rezervasyon bulunamadı.
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Müşteri</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Saha</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Saat</TableCell>
              <TableCell>Tutar</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.user.firstName} {reservation.user.lastName}</TableCell>
                <TableCell>{reservation.user.phone}</TableCell>
                <TableCell>Saha {reservation.field}</TableCell>
                <TableCell>{reservation.date}</TableCell>
                <TableCell>{reservation.startTime} - {reservation.endTime}</TableCell>
                <TableCell>{reservation.price} ₺</TableCell>
                <TableCell>
                  <Chip 
                    label={reservationStatuses.find(s => s.value === reservation.status)?.label || reservation.status} 
                    color={reservationStatuses.find(s => s.value === reservation.status)?.color || 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleUpdateStatus(reservation.id, 'onaylandı')}
                    disabled={reservation.status === 'onaylandı' || reservation.status === 'tamamlandı'}
                  >
                    <Check />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleUpdateStatus(reservation.id, 'iptal edildi')}
                    disabled={reservation.status === 'iptal edildi'}
                  >
                    <Close />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="info" 
                    onClick={() => handleEditReservation(reservation)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteReservation(reservation.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderDailySchedule = () => {
    // Bugünün tarihi
    const today = dateFilter || new Date();
    const formattedDate = format(today, 'dd.MM.yyyy');
    
    // Bu tarihteki rezervasyonlar
    const todayReservations = reservations.filter(res => res.date === formattedDate);
    
    // Çalışma saatleri
    const workingHours = Array.from({ length: 14 }, (_, i) => {
      const hour = i + 9; // 09:00'dan başla
      return {
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
      };
    });
    
    return (
      <Box sx={{ mt: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
          <DatePicker
            label="Tarih Seçin"
            value={dateFilter || new Date()}
            onChange={setDateFilter}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
          />
        </LocalizationProvider>
        
        <Grid container spacing={2}>
          {fields.map(field => (
            <Grid item xs={12} md={4} key={field.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {field.name}
                  </Typography>
                  
                  {workingHours.map((timeSlot, index) => {
                    // Bu saat ve saha için rezervasyon var mı?
                    const reservation = todayReservations.find(res => 
                      res.field === field.id && 
                      res.startTime === timeSlot.startTime
                    );
                    
                    return (
                      <Box 
                        key={index}
                        sx={{ 
                          p: 1, 
                          mb: 1, 
                          borderRadius: 1,
                          border: '1px solid #e0e0e0',
                          bgcolor: reservation ? 
                            (reservation.status === 'onaylandı' ? 'rgba(76, 175, 80, 0.1)' : 
                             reservation.status === 'iptal edildi' ? 'rgba(244, 67, 54, 0.1)' : 
                             'rgba(255, 152, 0, 0.1)') 
                            : 'transparent'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </Typography>
                          
                          {reservation ? (
                            <Chip 
                              label={`${reservation.user.firstName} ${reservation.user.lastName}`}
                              size="small"
                              color={
                                reservation.status === 'onaylandı' ? 'success' : 
                                reservation.status === 'iptal edildi' ? 'error' : 
                                'warning'
                              }
                            />
                          ) : (
                            <Chip label="Boş" size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {/* Sadece admin kullanıcılar yönetim panelini görebilir */}
      {isAdmin ? (
        <>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Halı Saha Yönetim Paneli - Sporyum 23
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Rezervasyon Listesi" />
              <Tab label="Günlük Program" />
            </Tabs>
          </Box>
          
          {tabValue === 0 && (
            <>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Müşteri Ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                    <DatePicker
                      label="Tarihe Göre Filtrele"
                      value={dateFilter}
                      onChange={setDateFilter}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Durum"
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {reservationStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Saha</InputLabel>
                    <Select
                      value={fieldFilter}
                      onChange={(e) => setFieldFilter(e.target.value)}
                      label="Saha"
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {fields.map((field) => (
                        <MenuItem key={field.id} value={field.id}>
                          {field.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    variant="outlined" 
                    startIcon={<Refresh />} 
                    onClick={() => {
                      setSearchTerm('');
                      setDateFilter(null);
                      setStatusFilter('');
                      setFieldFilter('');
                      fetchReservations();
                    }}
                    fullWidth
                  >
                    Sıfırla
                  </Button>
                </Grid>
              </Grid>
              
              {renderReservationsTable()}
            </>
          )}
          
          {tabValue === 1 && renderDailySchedule()}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Rezervasyon yapmak için lütfen giriş yapın.
          </Typography>
        </Box>
      )}
      
      {/* Rezervasyon Düzenleme Dialog - Sadece admin kullanıcılar için */}
      {isAdmin && (
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Rezervasyon Düzenle</DialogTitle>
          <DialogContent>
            {currentReservation && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Müşteri Adı"
                    value={currentReservation.user.firstName}
                    onChange={(e) => setCurrentReservation({
                      ...currentReservation,
                      user: {
                        ...currentReservation.user,
                        firstName: e.target.value
                      }
                    })}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Müşteri Soyadı"
                    value={currentReservation.user.lastName}
                    onChange={(e) => setCurrentReservation({
                      ...currentReservation,
                      user: {
                        ...currentReservation.user,
                        lastName: e.target.value
                      }
                    })}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={currentReservation.user.phone}
                    onChange={(e) => setCurrentReservation({
                      ...currentReservation,
                      user: {
                        ...currentReservation.user,
                        phone: e.target.value
                      }
                    })}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Saha</InputLabel>
                    <Select
                      value={currentReservation.field}
                      onChange={(e) => setCurrentReservation({
                        ...currentReservation,
                        field: e.target.value
                      })}
                      label="Saha"
                    >
                      {fields.map((field) => (
                        <MenuItem key={field.id} value={field.id}>
                          {field.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Başlangıç Saati"
                    value={currentReservation.startTime}
                    onChange={(e) => setCurrentReservation({
                      ...currentReservation,
                      startTime: e.target.value
                    })}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bitiş Saati"
                    value={currentReservation.endTime}
                    onChange={(e) => setCurrentReservation({
                      ...currentReservation,
                      endTime: e.target.value
                    })}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tarih"
                    value={currentReservation.date}
                    onChange={(e) => setCurrentReservation({
                      ...currentReservation,
                      date: e.target.value
                    })}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ücret (₺)"
                    type="number"
                    value={currentReservation.price}
                    onChange={(e) => setCurrentReservation({
                      ...currentReservation,
                      price: parseInt(e.target.value)
                    })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={currentReservation.status}
                      onChange={(e) => setCurrentReservation({
                        ...currentReservation,
                        status: e.target.value
                      })}
                      label="Durum"
                    >
                      {reservationStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default ReservationSystem;
