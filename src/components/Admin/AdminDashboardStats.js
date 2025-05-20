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
  Tooltip
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
  Star
} from '@mui/icons-material';

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
  Cell
} from 'recharts';

function AdminDashboardStats() {
  // State tanımlamaları
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    todayReservations: 0,
    weeklyReservations: 0,
    monthlyReservations: 0,
    totalIncome: 0,
    weeklyIncome: 0,
    customerCount: 0,
    occupancyRate: 0,
    popularTimes: [],
    recentBookings: [],
    fieldUtilization: [],
    monthlyTrend: []
  });

  // Verileri yükle
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Burada API'den istatistik verileri çekilecek
        // Şimdilik örnek veriler kullanalım
        
        // Gerçek uygulamada, bu veriler API'den alınacaktır
        const mockStats = {
          totalReservations: 248,
          todayReservations: 8,
          weeklyReservations: 42,
          monthlyReservations: 165,
          totalIncome: 24800,
          weeklyIncome: 4200,
          customerCount: 156,
          occupancyRate: 78,
          popularTimes: [
            { time: '18:00', count: 42, percentage: 90 },
            { time: '19:00', count: 38, percentage: 85 },
            { time: '20:00', count: 35, percentage: 80 },
            { time: '21:00', count: 30, percentage: 70 },
            { time: '17:00', count: 25, percentage: 60 },
          ],
          recentBookings: [
            { id: 1, customer: 'Ahmet Yılmaz', field: 'Saha 1', time: '18:00 - 19:00', date: '18.05.2023', amount: 350 },
            { id: 2, customer: 'Mehmet Demir', field: 'Saha 2', time: '19:00 - 20:00', date: '18.05.2023', amount: 350 },
            { id: 3, customer: 'Ali Kaya', field: 'Saha 1', time: '20:00 - 21:00', date: '18.05.2023', amount: 400 },
            { id: 4, customer: 'Kerem Yıldız', field: 'Saha 3', time: '18:00 - 19:00', date: '19.05.2023', amount: 350 },
            { id: 5, customer: 'Ozan Şimşek', field: 'Saha 2', time: '21:00 - 22:00', date: '19.05.2023', amount: 300 },
          ],
          fieldUtilization: [
            { name: 'Saha 1', value: 85 },
            { name: 'Saha 2', value: 75 },
            { name: 'Saha 3', value: 60 },
          ],
          monthlyTrend: [
            { name: 'Oca', reservations: 120, revenue: 12000 },
            { name: 'Şub', reservations: 130, revenue: 13000 },
            { name: 'Mar', reservations: 140, revenue: 14000 },
            { name: 'Nis', reservations: 150, revenue: 15000 },
            { name: 'May', reservations: 165, revenue: 16500 },
            { name: 'Haz', reservations: 180, revenue: 18000 },
          ]
        };
        
        setStats(mockStats);
        setLoading(false);
      } catch (error) {
        console.error('İstatistikler yüklenirken hata oluştu:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Verileri yenile
  const handleRefresh = () => {
    setLoading(true);
    // API'den verileri yeniden çek
    setTimeout(() => {
      // Gerçek uygulamada bu kısım API çağrısı ile değiştirilecek
      setLoading(false);
    }, 1000);
  };

  // Grafik renkleri
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Genel İstatistikler
        </Typography>
        <Tooltip title="Verileri Yenile">
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Ana metrikler */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <EventAvailable />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Rezervasyon
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {stats.totalReservations}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="caption" color="success.main">
                  %12 artış (son ay)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Haftalık Gelir
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {stats.weeklyIncome}₺
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="caption" color="success.main">
                  %8 artış (önceki hafta)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Aktif Müşteriler
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {stats.customerCount}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="caption" color="success.main">
                  %5 artış (son ay)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <SportsSoccer />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Doluluk Oranı
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    %{stats.occupancyRate}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="caption" color="success.main">
                  %3 artış (önceki ay)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diğer istatistikler ve grafikler */}
      <Grid container spacing={3}>
        {/* Aylık trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Aylık Rezervasyon ve Gelir Trendi
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Bar yAxisId="left" dataKey="reservations" fill="#8884d8" name="Rezervasyon Sayısı" />
                <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Gelir (₺)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* En popüler saatler */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', boxShadow: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              En Popüler Saatler
            </Typography>
            <List>
              {stats.popularTimes.map((item, index) => (
                <React.Fragment key={item.time}>
                  <ListItem
                    disableGutters
                    secondaryAction={
                      <Typography variant="body2" color="text.secondary">
                        {item.count} rezervasyon
                      </Typography>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'secondary.main' }}>
                        <AccessTime />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={`${item.time}`} 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={item.percentage} 
                            sx={{ flexGrow: 1, height: 6, borderRadius: 5 }} 
                          />
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            %{item.percentage}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < stats.popularTimes.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Saha Kullanım Oranları */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, height: '100%', boxShadow: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Saha Kullanım Oranları
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.fieldUtilization}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, value}) => `${name}: %${value}`}
                >
                  {stats.fieldUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Son Rezervasyonlar */}
        <Grid item xs={12} sm={6} md={8}>
          <Paper sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Son Rezervasyonlar
            </Typography>
            <List>
              {stats.recentBookings.map((booking, index) => (
                <React.Fragment key={booking.id}>
                  <ListItem
                    alignItems="flex-start"
                    disableGutters
                    secondaryAction={
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {booking.amount}₺
                      </Typography>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {booking.customer.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={booking.customer}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {booking.field} • {booking.time}
                          </Typography>
                          <Typography component="div" variant="caption" color="text.secondary">
                            <CalendarMonth fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {booking.date}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < stats.recentBookings.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboardStats; 