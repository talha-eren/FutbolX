import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Avatar,
  Stack,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Refresh,
  Edit,
  Delete,
  Person,
  CheckCircle,
  Phone,
  Email,
  CalendarMonth,
  Work,
  Save,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Mock staff data
const MOCK_STAFF = [
  { id: 1, name: 'Ahmet Yılmaz', position: 'Yönetici', phone: '555-123-4567', email: 'ahmet@example.com', startDate: '2022-01-15', status: 'active', salary: 8500, permissions: ['full_access'] },
  { id: 2, name: 'Ayşe Kaya', position: 'Kasiyer', phone: '555-234-5678', email: 'ayse@example.com', startDate: '2022-03-10', status: 'active', salary: 4500, permissions: ['reservations', 'payments'] },
  { id: 3, name: 'Mehmet Demir', position: 'Saha Görevlisi', phone: '555-345-6789', email: 'mehmet@example.com', startDate: '2022-02-20', status: 'active', salary: 5000, permissions: ['maintenance'] },
  { id: 4, name: 'Fatma Şahin', position: 'Kafeterya Görevlisi', phone: '555-456-7890', email: 'fatma@example.com', startDate: '2022-04-05', status: 'active', salary: 4200, permissions: ['cafe'] },
  { id: 5, name: 'Ali Öztürk', position: 'Temizlik Görevlisi', phone: '555-567-8901', email: 'ali@example.com', startDate: '2022-05-12', status: 'inactive', salary: 4000, permissions: ['maintenance'] },
  { id: 6, name: 'Zeynep Yıldız', position: 'Kasiyer', phone: '555-678-9012', email: 'zeynep@example.com', startDate: '2022-06-01', status: 'active', salary: 4500, permissions: ['reservations', 'payments'] },
  { id: 7, name: 'Can Kılıç', position: 'Güvenlik', phone: '555-789-0123', email: 'can@example.com', startDate: '2022-04-15', status: 'active', salary: 4800, permissions: ['security'] },
  { id: 8, name: 'Deniz Aydın', position: 'Saha Görevlisi', phone: '555-890-1234', email: 'deniz@example.com', startDate: '2022-07-10', status: 'active', salary: 5000, permissions: ['maintenance'] }
];

// Job positions
const POSITIONS = [
  'Yönetici',
  'Kasiyer',
  'Saha Görevlisi',
  'Kafeterya Görevlisi',
  'Temizlik Görevlisi',
  'Güvenlik',
  'Antrenör'
];

// Permission options
const PERMISSIONS = [
  { value: 'full_access', label: 'Tam Erişim', description: 'Sistem üzerinde tüm işlemleri yapabilir' },
  { value: 'reservations', label: 'Rezervasyonlar', description: 'Rezervasyon oluşturma ve düzenleme' },
  { value: 'payments', label: 'Ödemeler', description: 'Ödeme alma ve kaydetme' },
  { value: 'maintenance', label: 'Bakım', description: 'Bakım planlaması ve kaydı' },
  { value: 'cafe', label: 'Kafeterya', description: 'Kafeterya yönetimi' },
  { value: 'security', label: 'Güvenlik', description: 'Güvenlik yönetimi' },
  { value: 'reports', label: 'Raporlar', description: 'Rapor görüntüleme' }
];

function AdminStaffManagement() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with actual API call in production
        setTimeout(() => {
          setStaff(MOCK_STAFF);
          setFilteredStaff(MOCK_STAFF);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Personel verisi çekme hatası:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtering
  useEffect(() => {
    let result = [...staff];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone.includes(searchTerm) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredStaff(result);
  }, [staff, searchTerm, statusFilter]);
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Staff operations
  const handleAddStaff = () => {
    setCurrentStaff({
      id: null,
      name: '',
      position: '',
      phone: '',
      email: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      salary: 0,
      permissions: []
    });
    setOpenDialog(true);
  };
  
  const handleEditStaff = (staffMember) => {
    setCurrentStaff({ ...staffMember });
    setOpenDialog(true);
  };
  
  const handleDeleteStaff = (id) => {
    if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      const updatedStaff = staff.filter(item => item.id !== id);
      setStaff(updatedStaff);
    }
  };
  
  const handleSaveStaff = () => {
    if (!currentStaff.name || !currentStaff.position || !currentStaff.phone || !currentStaff.email) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    if (currentStaff.id) {
      // Update existing staff
      const updatedStaff = staff.map(item => 
        item.id === currentStaff.id ? currentStaff : item
      );
      setStaff(updatedStaff);
    } else {
      // Add new staff
      const newId = Math.max(...staff.map(item => item.id), 0) + 1;
      const newStaff = { ...currentStaff, id: newId };
      setStaff([...staff, newStaff]);
    }
    
    setOpenDialog(false);
  };
  
  const handlePermissionsClick = (staffMember) => {
    setCurrentStaff(staffMember);
    setSelectedPermissions(staffMember.permissions);
    setOpenPermissionsDialog(true);
  };
  
  const handleSavePermissions = () => {
    const updatedStaff = staff.map(item => 
      item.id === currentStaff.id ? { ...item, permissions: selectedPermissions } : item
    );
    setStaff(updatedStaff);
    setOpenPermissionsDialog(false);
  };
  
  const handlePermissionChange = (value) => {
    if (selectedPermissions.includes(value)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== value));
    } else {
      setSelectedPermissions([...selectedPermissions, value]);
    }
  };
  
  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const updatedStaff = staff.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    );
    setStaff(updatedStaff);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header and Tools */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#333' }}>
          Personel Yönetimi
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />} 
          onClick={handleAddStaff}
          sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)',
            }
          }}
        >
          Yeni Personel Ekle
        </Button>
      </Box>
      
      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Personel Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>Durum</InputLabel>
              <Select
                value={statusFilter}
                label="Durum"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="inactive">Pasif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              startIcon={<Refresh />} 
              sx={{ mr: 1 }}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Sıfırla
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Staff Table */}
      <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Personel</TableCell>
              <TableCell>Pozisyon</TableCell>
              <TableCell>İletişim</TableCell>
              <TableCell>Başlangıç</TableCell>
              <TableCell>Maaş</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: staffMember.status === 'active' ? '#4CAF50' : '#9e9e9e', mr: 2 }}>
                        {staffMember.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">
                        {staffMember.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{staffMember.position}</TableCell>
                  <TableCell>
                    <Stack>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2">{staffMember.phone}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                        <Typography variant="body2">{staffMember.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatDate(staffMember.startDate)}</TableCell>
                  <TableCell>{formatCurrency(staffMember.salary)}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={staffMember.status === 'active'}
                          onChange={() => handleStatusToggle(staffMember.id, staffMember.status)}
                          color="primary"
                        />
                      }
                      label={
                        <Chip 
                          size="small" 
                          label={staffMember.status === 'active' ? 'Aktif' : 'Pasif'} 
                          color={staffMember.status === 'active' ? 'success' : 'default'}
                          sx={{ fontWeight: 'medium' }}
                        />
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Düzenle">
                        <IconButton onClick={() => handleEditStaff(staffMember)} color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="İzinler">
                        <IconButton onClick={() => handlePermissionsClick(staffMember)} color="info">
                          <Person />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton onClick={() => handleDeleteStaff(staffMember.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            {filteredStaff.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Gösterilecek personel bulunamadı
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          component="div"
          count={filteredStaff.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Sayfa başına"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </TableContainer>
      
      {/* Add/Edit Staff Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {currentStaff?.id ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Personel Adı"
                value={currentStaff?.name || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pozisyon</InputLabel>
                <Select
                  value={currentStaff?.position || ''}
                  label="Pozisyon"
                  onChange={(e) => setCurrentStaff({ ...currentStaff, position: e.target.value })}
                  required
                >
                  {POSITIONS.map((position) => (
                    <MenuItem key={position} value={position}>{position}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={currentStaff?.phone || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={currentStaff?.email || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                type="date"
                value={currentStaff?.startDate || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maaş"
                type="number"
                value={currentStaff?.salary || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, salary: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentStaff?.status === 'active'}
                      onChange={(e) => setCurrentStaff({ ...currentStaff, status: e.target.checked ? 'active' : 'inactive' })}
                      color="primary"
                    />
                  }
                  label="Aktif"
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            startIcon={<CancelIcon />}
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleSaveStaff} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Permissions Dialog */}
      <Dialog open={openPermissionsDialog} onClose={() => setOpenPermissionsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Personel İzinleri: {currentStaff?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Bu personel için sistem erişim izinlerini belirleyin:
            </Typography>
            
            {PERMISSIONS.map((permission) => (
              <FormControlLabel
                key={permission.value}
                control={
                  <Switch
                    checked={selectedPermissions.includes(permission.value)}
                    onChange={() => handlePermissionChange(permission.value)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">{permission.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{permission.description}</Typography>
                  </Box>
                }
                sx={{ display: 'flex', mb: 1 }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenPermissionsDialog(false)} 
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleSavePermissions} 
            variant="contained" 
            color="primary"
          >
            İzinleri Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminStaffManagement; 