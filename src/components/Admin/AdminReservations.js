import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Alert,
  InputAdornment,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Check, 
  Close, 
  AccessTime,
  Search,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import axios from 'axios';

function AdminReservations() {
  // State tanımlamaları
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Verileri yükle
  useEffect(() => {
    fetchReservations();
  }, []);

    const fetchReservations = async () => {
      try {
      setLoading(true);
      setError(null);
      
      console.log('Rezervasyonlar yükleniyor...');
      
      // API'den rezervasyon verilerini çek - debug için
      console.log('MongoDB veritabanından rezervasyonlar getiriliyor...');
      
      // Önce direk veritabanı içeriğini kontrol et
      const dbResponse = await axios.get('/api/reservations/direct-mongodb');
      console.log('Tüm MongoDB içeriği:', dbResponse.data);
      console.log(`MongoDB'de toplam ${dbResponse.data.length} rezervasyon var`);
      
      // Şimdi normal API ile dene
      const response = await axios.get('/api/reservations/venue/sporyum23');
      console.log('API yanıtı:', response.data);
      
      if (response.data && response.data.reservations && response.data.reservations.length > 0) {
        console.log(`${response.data.reservations.length} adet rezervasyon bulundu`);
        
        const formattedReservations = response.data.reservations.map(res => ({
          id: res._id,
          date: format(new Date(res.date), 'dd.MM.yyyy'),
          startTime: res.startTime,
          endTime: res.endTime,
          user: {
            firstName: res.user?.firstName || 'Misafir',
            lastName: res.user?.lastName || '',
            phone: res.user?.phone || 'Belirtilmemiş',
            email: res.user?.email || ''
          },
          status: res.status || 'beklemede',
          price: res.price || 450,
          field: res.field || 1
        }));
        
        // Rezervasyonları tarihsel sıraya göre sırala (en yakın tarih en üstte)
        const sortedReservations = formattedReservations.sort((a, b) => {
          // Önce tarihe göre sırala (yeni tarihler önce)
          const dateA = new Date(a.date.split('.').reverse().join('-'));
          const dateB = new Date(b.date.split('.').reverse().join('-'));
          
          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;
          
          // Tarihler aynıysa saate göre sırala
          return a.startTime.localeCompare(b.startTime);
        });
        
        setReservations(sortedReservations);
        console.log('Rezervasyonlar yüklendi ve sıralandı:', sortedReservations.length);
      } else {
        console.warn('API yanıtında rezervasyon verisi bulunamadı, örnek veriler kullanılacak');
        // API'den veri gelmezse örnek veriler kullan
          const mockReservations = [
          { 
            id: 1, 
            user: { firstName: 'Örnek', lastName: 'Kullanıcı', phone: '0532 123 4567', email: 'ornek@example.com' }, 
            field: 1, 
            date: format(new Date(), 'dd.MM.yyyy'),
            startTime: '18:00', 
            endTime: '19:00', 
            price: 450, 
            status: 'onaylandı' 
          },
          { 
            id: 2, 
            user: { firstName: 'Test', lastName: 'Kullanıcı', phone: '0533 234 5678', email: 'test@example.com' }, 
            field: 2, 
            date: format(new Date(), 'dd.MM.yyyy'), 
            startTime: '19:00', 
            endTime: '20:00', 
            price: 450, 
            status: 'beklemede' 
          },
          ];
          
          setReservations(mockReservations);
      }
      } catch (error) {
        console.error('Rezervasyonlar yüklenirken hata oluştu:', error);
        setError('Rezervasyonlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      
        // Hata durumunda örnek veriler göster
        const mockReservations = [
          { 
            id: 1, 
            user: { firstName: 'Bağlantı', lastName: 'Hatası', phone: 'Sistem hatası nedeniyle veri gösterilemiyor', email: '' }, 
            field: 1, 
            date: format(new Date(), 'dd.MM.yyyy'), 
            startTime: '21:00', 
            endTime: '22:00', 
            price: 450, 
            status: 'onay bekliyor' 
          },
        ];
      
        setReservations(mockReservations);
      } finally {
        setLoading(false);
      }
    };

  // Sayfa değişikliği
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Sayfa başına satır sayısı değişikliği
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Rezervasyon düzenleme modalını aç
  const handleOpenEditDialog = (reservation) => {
    setSelectedReservation(reservation);
    setOpenDialog(true);
  };

  // Rezervasyon düzenleme modalını kapat
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReservation(null);
  };

  // Rezervasyon güncelleme
  const handleUpdateReservation = async () => {
    try {
      setLoading(true);
      
      // API'ye rezervasyon güncelleme isteği gönder
      await axios.patch(`/api/reservations/${selectedReservation.id}/status`, {
        status: selectedReservation.status
      });
      
      // Başarılı güncelleme - yerel state'i güncelle
    const updatedReservations = reservations.map(r => 
      r.id === selectedReservation.id ? selectedReservation : r
    );
    setReservations(updatedReservations);
    handleCloseDialog();
      setError(null);
    } catch (error) {
      console.error('Rezervasyon güncelleme hatası:', error);
      setError('Rezervasyon güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Durum değiştirme dialogunu aç
  const openStatusDialog = (reservation, initialStatus) => {
    setSelectedReservation(reservation);
    setNewStatus(initialStatus || reservation.status || 'beklemede');
    setStatusDialogOpen(true);
  };

  // Rezervasyon durumunu güncelleme
  const handleStatusChange = async () => {
    if (!selectedReservation || !newStatus) return;
    
    try {
      setLoading(true);
      
      // API isteği ile rezervasyon durumunu güncelle
      await axios.patch(`/api/reservations/${selectedReservation.id}/status`, {
        status: newStatus
      });
      
      // State'deki rezervasyon listesini güncelle
    const updatedReservations = reservations.map(r => 
        r.id === selectedReservation.id 
          ? {...r, status: newStatus} 
          : r
    );
    setReservations(updatedReservations);
      
      setError(null);
      setStatusDialogOpen(false);
      setSelectedReservation(null);
      setNewStatus('');
      
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      setError('Rezervasyon durumu güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme ve arama
  const filteredReservations = reservations.filter(reservation => {
    const customerName = `${reservation.user.firstName} ${reservation.user.lastName}`.trim();
    
    const matchesSearch = 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user.phone.includes(searchTerm) ||
      `Saha ${reservation.field}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    
    const matchesDate = !filterDate || reservation.date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Verileri yenile
  const handleRefresh = () => {
    console.log('Manuel yenileme başlatıldı...');
    setLoading(true);
    setError(null);
    fetchReservations();
  };

  // Durum renkleri
  const getStatusColor = (status) => {
    switch (status) {
      case 'onaylandı':
        return 'success';
      case 'beklemede':
      case 'onay bekliyor':
        return 'warning';
      case 'iptal edildi':
        return 'error';
      case 'tamamlandı':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Rezervasyon Yönetimi
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Filtrele">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterList />
            </IconButton>
          </Tooltip>
          <Button 
            variant="outlined" 
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />} 
            onClick={handleRefresh}
            disabled={loading}
            size="small"
            color="primary"
          >
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Arama ve Filtreler */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="İsim, telefon veya saha ile ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {showFilters && (
            <>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Durum"
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="onaylandı">Onaylandı</MenuItem>
                    <MenuItem value="beklemede">Beklemede</MenuItem>
                    <MenuItem value="iptal edildi">İptal Edildi</MenuItem>
                    <MenuItem value="tamamlandı">Tamamlandı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Tarih"
                  value={filterDate}
                  onChange={(newValue) => setFilterDate(format(new Date(newValue), 'dd.MM.yyyy'))}
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterDate(null);
                  }}
                  fullWidth
                >
                  Filtreleri Sıfırla
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Rezervasyon Tablosu */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Rezervasyon Yönetimi {reservations.length > 0 && `(${reservations.length} rezervasyon)`}
      </Typography>
      
      <TableContainer component={Paper} sx={{ maxHeight: 650, overflowY: 'auto' }}>
        <Table aria-label="rezervasyon tablosu">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Müşteri</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>İletişim</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Saha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tarih</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Saat</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tutar</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
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
            ) : filteredReservations.length > 0 ? (
              filteredReservations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((reservation) => (
                  <TableRow key={reservation.id} 
                    sx={{ 
                      bgcolor: 
                        reservation.status === 'beklemede' || reservation.status === 'onay bekliyor' ? 'rgba(255, 235, 59, 0.1)' : 
                        reservation.status === 'onaylandı' ? 'rgba(76, 175, 80, 0.1)' : 
                        reservation.status === 'iptal edildi' ? 'rgba(244, 67, 54, 0.1)' : 
                        'transparent' 
                    }}
                  >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                          {reservation.user.firstName?.charAt(0) || 'M'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {reservation.user.firstName} {reservation.user.lastName}
                          </Typography>
                        </Box>
                    </Box>
                  </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {reservation.user.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {reservation.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>Saha {reservation.field}</TableCell>
                    <TableCell>{reservation.date}</TableCell>
                    <TableCell>{reservation.startTime} - {reservation.endTime}</TableCell>
                    <TableCell>{reservation.price} ₺</TableCell>
                  <TableCell>
                    <Chip 
                        label={reservation.status === 'onaylandı' ? 'Onaylandı' : 
                               reservation.status === 'iptal edildi' ? 'İptal Edildi' : 
                               reservation.status === 'tamamlandı' ? 'Tamamlandı' : 'Onay Bekliyor'} 
                      color={getStatusColor(reservation.status)}
                      size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
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
                          onClick={() => handleOpenEditDialog(reservation)}
                          title="Düzenle"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Rezervasyon bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredReservations.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Sayfa başına satır:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />

      {/* Rezervasyon Düzenleme Modal */}
      {selectedReservation && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Rezervasyon Düzenle</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Müşteri Adı"
                  value={`${selectedReservation.user.firstName} ${selectedReservation.user.lastName}`.trim()}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={selectedReservation.user.phone}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                    label="Saha"
                  value={`Saha ${selectedReservation.field}`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tarih"
                  value={selectedReservation.date}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Saat"
                  value={`${selectedReservation.startTime} - ${selectedReservation.endTime}`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tutar (₺)"
                  type="number"
                  value={selectedReservation.price}
                  disabled
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₺</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={selectedReservation.status}
                    label="Durum"
                    onChange={(e) => setSelectedReservation({
                      ...selectedReservation, 
                      status: e.target.value
                    })}
                  >
                    <MenuItem value="onaylandı">Onaylandı</MenuItem>
                    <MenuItem value="beklemede">Beklemede</MenuItem>
                    <MenuItem value="iptal edildi">İptal Edildi</MenuItem>
                    <MenuItem value="tamamlandı">Tamamlandı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button 
              onClick={handleUpdateReservation} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

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
                  <strong>Müşteri:</strong> {selectedReservation.user.firstName} {selectedReservation.user.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Tarih:</strong> {selectedReservation.date}
                </Typography>
                <Typography variant="body2">
                  <strong>Saat:</strong> {selectedReservation.startTime} - {selectedReservation.endTime}
                </Typography>
                <Typography variant="body2">
                  <strong>Saha:</strong> Saha {selectedReservation.field}
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
}

export default AdminReservations; 