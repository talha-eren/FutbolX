import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  EventAvailable,
  People,
  AttachMoney,
  SportsSoccer,
  AccessTime,
  Refresh,
  CalendarMonth,
  Star,
  Add,
  Edit,
  Delete,
  Save,
  Cancel
} from '@mui/icons-material';
import axios from 'axios';

// Grafik bileşenleri için (isteğe bağlı)
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  CircularProgressbar
} from 'recharts';

function AdminDashboardStats() {
  // State tanımlamaları
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Halı saha verileri
  const [fieldData, setFieldData] = useState({
    totalUsers: 248,
    totalVenues: 3,
    weeklyReservations: 156,
    monthlyRevenue: 24800,
    occupancyRate: 85,
    topScorers: [
      { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', goalsScored: 15, position: 'Forvet' },
      { id: 2, firstName: 'Mehmet', lastName: 'Demir', goalsScored: 12, position: 'Orta Saha' },
      { id: 3, firstName: 'Ali', lastName: 'Kaya', goalsScored: 10, position: 'Forvet' },
      { id: 4, firstName: 'Kerem', lastName: 'Yıldız', goalsScored: 8, position: 'Kanat' },
      { id: 5, firstName: 'Ozan', lastName: 'Şimşek', goalsScored: 7, position: 'Defans' }
    ],
    activeTeams: [
      { id: 1, name: 'Elazığ Spor', matchCount: 25, memberCount: 15 },
      { id: 2, name: 'Fırat FC', matchCount: 22, memberCount: 12 },
      { id: 3, name: 'Harput United', matchCount: 20, memberCount: 18 },
      { id: 4, name: 'Sporyum 23 FC', matchCount: 18, memberCount: 14 },
      { id: 5, name: 'Elazığ City', matchCount: 16, memberCount: 11 }
    ],
    recentReservations: [
      { id: 1, customer: 'Ahmet Yılmaz', field: 'Saha 1', time: '18:00 - 19:00', date: '2024-01-20', amount: 450 },
      { id: 2, customer: 'Mehmet Demir', field: 'Saha 2', time: '19:00 - 20:00', date: '2024-01-20', amount: 450 },
      { id: 3, customer: 'Ali Kaya', field: 'Saha 1', time: '20:00 - 21:00', date: '2024-01-20', amount: 450 },
      { id: 4, customer: 'Kerem Yıldız', field: 'Saha 3', time: '18:00 - 19:00', date: '2024-01-21', amount: 450 },
      { id: 5, customer: 'Ozan Şimşek', field: 'Saha 2', time: '21:00 - 22:00', date: '2024-01-21', amount: 450 }
    ],
    monthlyTrend: [
      { name: 'Oca', reservations: 120, revenue: 54000 },
      { name: 'Şub', reservations: 130, revenue: 58500 },
      { name: 'Mar', reservations: 140, revenue: 63000 },
      { name: 'Nis', reservations: 150, revenue: 67500 },
      { name: 'May', reservations: 165, revenue: 74250 },
      { name: 'Haz', reservations: 180, revenue: 81000 }
    ]
  });

  // Form verileri
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    value: '',
    field: '',
    time: '',
    date: '',
    amount: '',
    position: '',
    goalsScored: '',
    matchCount: '',
    memberCount: ''
  });

  // Verileri localStorage'a kaydet
  const saveToLocalStorage = (data) => {
    localStorage.setItem('fieldManagementData', JSON.stringify(data));
  };

  // Verileri localStorage'dan yükle
  useEffect(() => {
    const savedData = localStorage.getItem('fieldManagementData');
    if (savedData) {
      try {
        setFieldData(JSON.parse(savedData));
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      }
    }
  }, []);

  // Yeni veri ekleme
  const handleAddData = () => {
    if (!formData.type) return;

    const newData = { ...fieldData };
    const newId = Date.now();

    switch (formData.type) {
      case 'topScorer':
        newData.topScorers.push({
          id: newId,
          firstName: formData.name.split(' ')[0] || '',
          lastName: formData.name.split(' ')[1] || '',
          goalsScored: parseInt(formData.goalsScored) || 0,
          position: formData.position || 'Belirsiz'
        });
        break;
      
      case 'activeTeam':
        newData.activeTeams.push({
          id: newId,
          name: formData.name,
          matchCount: parseInt(formData.matchCount) || 0,
          memberCount: parseInt(formData.memberCount) || 0
        });
        break;
      
      case 'reservation':
        newData.recentReservations.unshift({
          id: newId,
          customer: formData.name,
          field: formData.field,
          time: formData.time,
          date: formData.date,
          amount: parseInt(formData.amount) || 0
        });
        // Son 10 rezervasyonu tut
        if (newData.recentReservations.length > 10) {
          newData.recentReservations = newData.recentReservations.slice(0, 10);
        }
        break;
      
      case 'stats':
        newData.totalUsers = parseInt(formData.totalUsers) || newData.totalUsers;
        newData.weeklyReservations = parseInt(formData.weeklyReservations) || newData.weeklyReservations;
        newData.monthlyRevenue = parseInt(formData.monthlyRevenue) || newData.monthlyRevenue;
        newData.occupancyRate = parseInt(formData.occupancyRate) || newData.occupancyRate;
        break;
    }

    setFieldData(newData);
    saveToLocalStorage(newData);
    setOpenDialog(false);
    resetForm();
  };

  // Veri silme
  const handleDeleteData = (type, id) => {
    const newData = { ...fieldData };
    
    switch (type) {
      case 'topScorer':
        newData.topScorers = newData.topScorers.filter(item => item.id !== id);
        break;
      case 'activeTeam':
        newData.activeTeams = newData.activeTeams.filter(item => item.id !== id);
        break;
      case 'reservation':
        newData.recentReservations = newData.recentReservations.filter(item => item.id !== id);
        break;
    }
    
    setFieldData(newData);
    saveToLocalStorage(newData);
  };

  // Form sıfırlama
  const resetForm = () => {
    setFormData({
      type: '',
      name: '',
      value: '',
      field: '',
      time: '',
      date: '',
      amount: '',
      position: '',
      goalsScored: '',
      matchCount: '',
      memberCount: ''
    });
    setEditingItem(null);
  };

  // Dialog açma
  const handleOpenDialog = (type = '') => {
    setFormData({ ...formData, type });
    setOpenDialog(true);
  };

  // Hesaplamalar
  const calculateStats = () => {
    const totalReservationAmount = fieldData.recentReservations.reduce((sum, res) => sum + res.amount, 0);
    const averageReservationAmount = fieldData.recentReservations.length > 0 
      ? Math.round(totalReservationAmount / fieldData.recentReservations.length) 
      : 0;
    
    return {
      totalReservationAmount,
      averageReservationAmount,
      totalGoals: fieldData.topScorers.reduce((sum, player) => sum + player.goalsScored, 0),
      totalMatches: fieldData.activeTeams.reduce((sum, team) => sum + team.matchCount, 0),
      totalTeamMembers: fieldData.activeTeams.reduce((sum, team) => sum + team.memberCount, 0)
    };
  };

  const calculatedStats = calculateStats();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight="bold">
          📊 Halı Saha Yönetim Paneli
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
        >
          Yeni Veri Ekle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Genel İstatistikler */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {fieldData.totalUsers}
                  </Typography>
                  <Typography variant="body2">
                    Toplam Kullanıcı
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {fieldData.weeklyReservations}
                  </Typography>
                  <Typography variant="body2">
                    Haftalık Rezervasyon
                  </Typography>
                </Box>
                <CalendarMonth sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ₺{fieldData.monthlyRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Aylık Gelir
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    %{fieldData.occupancyRate}
                  </Typography>
                  <Typography variant="body2">
                    Doluluk Oranı
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hesaplanan İstatistikler */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="📈 Hesaplanan İstatistikler" />
            <CardContent>
      <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      ₺{calculatedStats.totalReservationAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Rezervasyon Tutarı
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      ₺{calculatedStats.averageReservationAmount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ortalama Rezervasyon Tutarı
            </Typography>
                  </Box>
        </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {calculatedStats.totalGoals}
            </Typography>
                      <Typography variant="body2" color="text.secondary">
                      Toplam Gol Sayısı
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {calculatedStats.totalMatches}
                      </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Maç Sayısı
                          </Typography>
                        </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Veri Yönetimi Tabloları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* En Çok Gol Atan Oyuncular */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="🏆 En Çok Gol Atan Oyuncular" 
              action={
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog('topScorer')}
                >
                  Ekle
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sıra</TableCell>
                      <TableCell>İsim</TableCell>
                      <TableCell>Pozisyon</TableCell>
                      <TableCell>Gol</TableCell>
                      <TableCell>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fieldData.topScorers.map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            color={index < 3 ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{player.firstName} {player.lastName}</TableCell>
                        <TableCell>{player.position}</TableCell>
                        <TableCell>
                          <Chip label={player.goalsScored} size="small" color="success" />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteData('topScorer', player.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* En Aktif Takımlar */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="🔥 En Aktif Takımlar" 
              action={
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog('activeTeam')}
                >
                  Ekle
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sıra</TableCell>
                      <TableCell>Takım</TableCell>
                      <TableCell>Maç</TableCell>
                      <TableCell>Üye</TableCell>
                      <TableCell>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fieldData.activeTeams.map((team, index) => (
                      <TableRow key={team.id}>
                        <TableCell>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            color={index < 3 ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{team.name}</TableCell>
                        <TableCell>
                          <Chip label={team.matchCount} size="small" color="info" />
                        </TableCell>
                        <TableCell>
                          <Chip label={team.memberCount} size="small" color="warning" />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteData('activeTeam', team.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        </Grid>

        {/* Son Rezervasyonlar */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="📅 Son Rezervasyonlar" 
              action={
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog('reservation')}
                >
                  Ekle
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Müşteri</TableCell>
                      <TableCell>Saha</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Saat</TableCell>
                      <TableCell>Tutar</TableCell>
                      <TableCell>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fieldData.recentReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.customer}</TableCell>
                        <TableCell>
                          <Chip label={reservation.field} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{reservation.date}</TableCell>
                        <TableCell>{reservation.time}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`₺${reservation.amount}`} 
                            size="small" 
                            color="success" 
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteData('reservation', reservation.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Aylık Trend Grafiği */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="📊 Aylık Rezervasyon ve Gelir Trendi" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fieldData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="reservations" 
                    stroke="#4CAF50" 
                    strokeWidth={3}
                    name="Rezervasyon Sayısı"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2196F3" 
                    strokeWidth={3}
                    name="Gelir (₺)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Veriyi Düzenle' : 'Yeni Veri Ekle'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="type-label">Veri Tipi</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              value={formData.type}
              label="Veri Tipi"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="topScorer">🏆 Top Skorcu</MenuItem>
              <MenuItem value="activeTeam">🔥 Aktif Takım</MenuItem>
              <MenuItem value="reservation">📅 Rezervasyon</MenuItem>
              <MenuItem value="stats">📊 Genel İstatistikler</MenuItem>
            </Select>
          </FormControl>

          {formData.type === 'topScorer' && (
            <>
              <TextField
                label="İsim Soyisim"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                margin="normal"
                placeholder="Örn: Ahmet Yılmaz"
              />
              <TextField
                label="Pozisyon"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                fullWidth
                margin="normal"
                placeholder="Örn: Forvet, Orta Saha, Defans"
              />
              <TextField
                label="Gol Sayısı"
                type="number"
                value={formData.goalsScored}
                onChange={(e) => setFormData({ ...formData, goalsScored: e.target.value })}
                fullWidth
                margin="normal"
              />
            </>
          )}

          {formData.type === 'activeTeam' && (
            <>
              <TextField
                label="Takım Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                margin="normal"
                placeholder="Örn: Elazığ Spor"
              />
              <TextField
                label="Maç Sayısı"
                type="number"
                value={formData.matchCount}
                onChange={(e) => setFormData({ ...formData, matchCount: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Üye Sayısı"
                type="number"
                value={formData.memberCount}
                onChange={(e) => setFormData({ ...formData, memberCount: e.target.value })}
                fullWidth
                margin="normal"
              />
            </>
          )}

          {formData.type === 'reservation' && (
            <>
              <TextField
                label="Müşteri Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                margin="normal"
                placeholder="Örn: Ahmet Yılmaz"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Saha</InputLabel>
                <Select
                  value={formData.field}
                  label="Saha"
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                >
                  <MenuItem value="Saha 1">Saha 1</MenuItem>
                  <MenuItem value="Saha 2">Saha 2</MenuItem>
                  <MenuItem value="Saha 3">Saha 3</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Saat"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                fullWidth
                margin="normal"
                placeholder="Örn: 18:00 - 19:00"
              />
              <TextField
                label="Tarih"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Tutar (₺)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                fullWidth
                margin="normal"
              />
            </>
          )}

          {formData.type === 'stats' && (
            <>
              <TextField
                label="Toplam Kullanıcı"
                type="number"
                value={formData.totalUsers || fieldData.totalUsers}
                onChange={(e) => setFormData({ ...formData, totalUsers: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Haftalık Rezervasyon"
                type="number"
                value={formData.weeklyReservations || fieldData.weeklyReservations}
                onChange={(e) => setFormData({ ...formData, weeklyReservations: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Aylık Gelir (₺)"
                type="number"
                value={formData.monthlyRevenue || fieldData.monthlyRevenue}
                onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Doluluk Oranı (%)"
                type="number"
                value={formData.occupancyRate || fieldData.occupancyRate}
                onChange={(e) => setFormData({ ...formData, occupancyRate: e.target.value })}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleAddData} 
            variant="contained" 
            color="primary"
            disabled={!formData.type}
          >
            {editingItem ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDashboardStats; 