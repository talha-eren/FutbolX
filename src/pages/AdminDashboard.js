import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Container,
  Divider,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  CalendarMonth, 
  AttachMoney, 
  People, 
  Build,
  Refresh
} from '@mui/icons-material';

// Admin paneli bileşenleri
import AdminDashboardStats from '../components/Admin/AdminDashboardStats';
import AdminReservations from '../components/Admin/AdminReservations';
import AdminFinancialReports from '../components/Admin/AdminFinancialReports';
import AdminStaffManagement from '../components/Admin/AdminStaffManagement';
import AdminMaintenance from '../components/Admin/AdminMaintenance';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tab değişikliğini işle
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Admin kontrolü
  useEffect(() => {
    // Gerçek uygulamada, bu kontrol sunucu taraflı yapılmalıdır
    const userRole = localStorage.getItem('userRole') || '';
    const isUserAdmin = userRole === 'admin' || userRole === 'owner';
    
    // talhaeren kullanıcısını admin yapalım
    const username = localStorage.getItem('username') || '';
    if (username === 'talhaeren') {
      setIsAdmin(true);
    } else {
      // Geliştirme aşamasında her kullanıcıyı admin yapalım
      setIsAdmin(true); // Gerçek uygulamada isUserAdmin olarak değiştirilmeli
    }
    setLoading(false);
  }, []);

  // Admin olmayan kullanıcılar için bildirim
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAdmin && !loading) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen halı saha sahibi veya yönetici olarak giriş yapın.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
            Halı Saha Yönetim Paneli
          </Typography>
        </Box>
        
        <Paper sx={{ mt: 3, mb: 3, overflow: 'hidden' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: '#f7f7f7',
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '0.9rem',
                fontWeight: 'medium',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.08)'
                }
              }
            }}
          >
            <Tab icon={<CalendarMonth />} label="Rezervasyonlar" iconPosition="start" />
            <Tab icon={<DashboardIcon />} label="Genel Bakış" iconPosition="start" />
            <Tab icon={<AttachMoney />} label="Finansal Raporlar" iconPosition="start" />
            <Tab icon={<People />} label="Personel Yönetimi" iconPosition="start" />
            <Tab icon={<Build />} label="Bakım Planlaması" iconPosition="start" />
          </Tabs>
          
          <Divider />
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <AdminReservations />}
            {activeTab === 1 && <AdminDashboardStats />}
            {activeTab === 2 && <AdminFinancialReports />}
            {activeTab === 3 && <AdminStaffManagement />}
            {activeTab === 4 && <AdminMaintenance />}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminDashboard; 