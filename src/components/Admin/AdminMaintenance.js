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
  Card,
  CardContent,
  LinearProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add,
  Build,
  CalendarMonth,
  CheckCircle,
  Delete,
  Edit,
  Refresh,
  Search,
  Warning,
  Done,
  Schedule,
  Save,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Mock bakım görevleri veri
const MOCK_MAINTENANCE_TASKS = [
  { id: 1, title: 'Saha 1 Çim Bakımı', description: 'Kesim ve sulama işlemleri', fieldId: 1, priority: 'high', status: 'pending', dueDate: '2023-06-20', cost: 750, assignedTo: 'Mehmet Demir' },
  { id: 2, title: 'Saha 2 Çizgi Yenileme', description: 'Tüm saha çizgilerinin yenilenmesi', fieldId: 2, priority: 'medium', status: 'completed', dueDate: '2023-06-15', completedDate: '2023-06-15', cost: 500, assignedTo: 'Ali Öztürk' },
  { id: 3, title: 'Duş Kabinleri Tamiratı', description: 'Soyunma odalarındaki duş başlıklarının değişimi', fieldId: null, priority: 'low', status: 'pending', dueDate: '2023-06-25', cost: 350, assignedTo: 'Ali Öztürk' },
  { id: 4, title: 'Kale Ağları Değişimi', description: 'Yırtık kale ağlarının yenilenmesi', fieldId: 3, priority: 'medium', status: 'pending', dueDate: '2023-06-18', cost: 600, assignedTo: 'Mehmet Demir' },
  { id: 5, title: 'Aydınlatma Sistemi Bakımı', description: 'Tüm sahaların aydınlatma kontrolü ve ampul değişimi', fieldId: null, priority: 'high', status: 'in_progress', dueDate: '2023-06-19', cost: 1200, assignedTo: 'Hasan Yılmaz' },
  { id: 6, title: 'Kafeterya Ekipman Bakımı', description: 'Kahve makinesi ve buzdolabı bakımı', fieldId: null, priority: 'low', status: 'completed', dueDate: '2023-06-12', completedDate: '2023-06-10', cost: 400, assignedTo: 'Fatma Şahin' },
  { id: 7, title: 'Sulama Sistemi Kontrolü', description: 'Otomatik sulama sisteminin kontrolü ve tamiri', fieldId: null, priority: 'medium', status: 'completed', dueDate: '2023-06-10', completedDate: '2023-06-09', cost: 300, assignedTo: 'Mehmet Demir' },
  { id: 8, title: 'Saha 3 Kapı Tamiri', description: 'Giriş kapısının menteşe değişimi', fieldId: 3, priority: 'high', status: 'in_progress', dueDate: '2023-06-17', cost: 250, assignedTo: 'Ali Öztürk' }
];

// Sahalar
const FIELDS = [
  { id: 1, name: 'Saha 1' },
  { id: 2, name: 'Saha 2' },
  { id: 3, name: 'Saha 3' }
];

// Bakımdan sorumlu personel
const STAFF = [
  'Mehmet Demir',
  'Ali Öztürk',
  'Hasan Yılmaz',
  'Fatma Şahin'
];

function AdminMaintenance() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  
  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        // API'den veri alma simulasyonu
        setTimeout(() => {
          setTasks(MOCK_MAINTENANCE_TASKS);
          setFilteredTasks(MOCK_MAINTENANCE_TASKS);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Bakım verisi çekme hatası:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtreleme
  useEffect(() => {
    let result = [...tasks];
    
    // Arama filtresini uygula
    if (searchTerm) {
      result = result.filter(
        item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Durum filtresini uygula
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter]);
  
  // Sayfalama işleyicileri
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Görev işlemleri
  const handleAddTask = () => {
    setCurrentTask({
      id: null,
      title: '',
      description: '',
      fieldId: '',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0],
      cost: 0,
      assignedTo: STAFF[0]
    });
    setOpenDialog(true);
  };
  
  const handleEditTask = (task) => {
    setCurrentTask({ ...task });
    setOpenDialog(true);
  };
  
  const handleDeleteTask = (id) => {
    if (window.confirm('Bu bakım görevini silmek istediğinizden emin misiniz?')) {
      const updatedTasks = tasks.filter(item => item.id !== id);
      setTasks(updatedTasks);
    }
  };
  
  const handleSaveTask = () => {
    if (!currentTask.title || !currentTask.dueDate || !currentTask.assignedTo) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    
    if (currentTask.id) {
      // Mevcut görevi güncelle
      const updatedTasks = tasks.map(item => 
        item.id === currentTask.id ? currentTask : item
      );
      setTasks(updatedTasks);
    } else {
      // Yeni görev ekle
      const newId = Math.max(...tasks.map(item => item.id), 0) + 1;
      const newTask = { ...currentTask, id: newId };
      setTasks([...tasks, newTask]);
    }
    
    setOpenDialog(false);
  };
  
  const handleUpdateStatus = (id, newStatus) => {
    const updatedTasks = tasks.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, status: newStatus };
        if (newStatus === 'completed') {
          updatedItem.completedDate = new Date().toISOString().split('T')[0];
        } else {
          delete updatedItem.completedDate;
        }
        return updatedItem;
      }
      return item;
    });
    setTasks(updatedTasks);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip size="small" icon={<Schedule />} label="Bekliyor" color="warning" />;
      case 'in_progress':
        return <Chip size="small" icon={<Build />} label="Devam Ediyor" color="info" />;
      case 'completed':
        return <Chip size="small" icon={<Done />} label="Tamamlandı" color="success" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };
  
  const getPriorityChip = (priority) => {
    switch (priority) {
      case 'high':
        return <Chip size="small" label="Yüksek" color="error" variant="outlined" />;
      case 'medium':
        return <Chip size="small" label="Orta" color="warning" variant="outlined" />;
      case 'low':
        return <Chip size="small" label="Düşük" color="info" variant="outlined" />;
      default:
        return <Chip size="small" label={priority} variant="outlined" />;
    }
  };
  
  const getFieldName = (fieldId) => {
    if (!fieldId) return 'Genel Alan';
    const field = FIELDS.find(f => f.id === fieldId);
    return field ? field.name : 'Bilinmiyor';
  };
  
  // Bakım özeti istatistikleri
  const getMaintenanceStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const totalCost = tasks.reduce((sum, task) => sum + task.cost, 0);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, inProgress, totalCost, completionRate };
  };
  
  const stats = getMaintenanceStats();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Başlık ve Düğme */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#333' }}>
          Bakım Planlaması
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />} 
          onClick={handleAddTask}
          sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)',
            }
          }}
        >
          Yeni Bakım Görevi
        </Button>
      </Box>
      
      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tamamlanma Oranı
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mr: 1 }}>
                  %{stats.completionRate}
                </Typography>
                <CheckCircle color="success" />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.completionRate} 
                sx={{ height: 8, borderRadius: 4 }} 
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.completed} / {stats.total} görev tamamlandı
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bekleyen Görevler
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bakım bekleyen işler
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Devam Eden
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Şu anda çalışılan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Toplam Maliyet
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(stats.totalCost)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bakım bütçesi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Arama ve Filtreler */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Bakım görevi ara..."
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
                <MenuItem value="pending">Bekleyenler</MenuItem>
                <MenuItem value="in_progress">Devam Edenler</MenuItem>
                <MenuItem value="completed">Tamamlananlar</MenuItem>
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
      
      {/* Bakım Görevleri Tablosu */}
      <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Görev</TableCell>
              <TableCell>Alan</TableCell>
              <TableCell>Öncelik</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Görevli</TableCell>
              <TableCell>Maliyet</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getFieldName(task.fieldId)}</TableCell>
                  <TableCell>{getPriorityChip(task.priority)}</TableCell>
                  <TableCell>{getStatusChip(task.status)}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        <CalendarMonth sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-top' }} />
                        {formatDate(task.dueDate)}
                      </Typography>
                      {task.completedDate && (
                        <Typography variant="body2" color="success.main" sx={{ fontSize: 13 }}>
                          <Done sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-top' }} />
                          {formatDate(task.completedDate)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{task.assignedTo}</TableCell>
                  <TableCell>{formatCurrency(task.cost)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {task.status !== 'completed' && (
                        <Tooltip title="Tamamlandı İşaretle">
                          <IconButton 
                            onClick={() => handleUpdateStatus(task.id, 'completed')} 
                            color="success"
                            size="small"
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Düzenle">
                        <IconButton 
                          onClick={() => handleEditTask(task)} 
                          color="primary"
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton 
                          onClick={() => handleDeleteTask(task.id)} 
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Gösterilecek bakım görevi bulunamadı
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          component="div"
          count={filteredTasks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Sayfa başına"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </TableContainer>
      
      {/* Bakım Görevi Ekleme/Düzenleme Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {currentTask?.id ? 'Bakım Görevi Düzenle' : 'Yeni Bakım Görevi Ekle'}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Görev Başlığı"
                value={currentTask?.title || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Alan/Saha</InputLabel>
                <Select
                  value={currentTask?.fieldId || ''}
                  label="Alan/Saha"
                  onChange={(e) => setCurrentTask({ ...currentTask, fieldId: e.target.value })}
                >
                  <MenuItem value="">Genel Alan</MenuItem>
                  {FIELDS.map((field) => (
                    <MenuItem key={field.id} value={field.id}>{field.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                value={currentTask?.description || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={currentTask?.priority || 'medium'}
                  label="Öncelik"
                  onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })}
                >
                  <MenuItem value="high">Yüksek</MenuItem>
                  <MenuItem value="medium">Orta</MenuItem>
                  <MenuItem value="low">Düşük</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={currentTask?.status || 'pending'}
                  label="Durum"
                  onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
                >
                  <MenuItem value="pending">Bekliyor</MenuItem>
                  <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                  <MenuItem value="completed">Tamamlandı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                type="date"
                value={currentTask?.dueDate || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maliyet"
                type="number"
                value={currentTask?.cost || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, cost: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Görevli Personel</InputLabel>
                <Select
                  value={currentTask?.assignedTo || ''}
                  label="Görevli Personel"
                  onChange={(e) => setCurrentTask({ ...currentTask, assignedTo: e.target.value })}
                  required
                >
                  {STAFF.map((staff) => (
                    <MenuItem key={staff} value={staff}>{staff}</MenuItem>
                  ))}
                </Select>
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
            onClick={handleSaveTask} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminMaintenance; 