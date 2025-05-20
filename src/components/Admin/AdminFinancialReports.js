import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  CalendarMonth,
  FileDownload,
  Refresh,
  LocalPrintshop,
  Visibility,
  CategoryOutlined
} from '@mui/icons-material';

// Mock data
const MOCK_FINANCIAL_DATA = {
  summary: {
    totalRevenue: 87520,
    reservationRevenue: 78350,
    additionalRevenue: 9170,
    expenses: 27450,
    profit: 60070,
    comparedToLastPeriod: {
      revenue: 12.5,
      expenses: -3.2,
      profit: 18.7
    }
  },
  revenueByMonth: [
    { month: 'Ocak', revenue: 12500, expenses: 4200, profit: 8300 },
    { month: 'Şubat', revenue: 11800, expenses: 3800, profit: 8000 },
    { month: 'Mart', revenue: 13200, expenses: 4100, profit: 9100 },
    { month: 'Nisan', revenue: 14800, expenses: 4500, profit: 10300 },
    { month: 'Mayıs', revenue: 16200, expenses: 5100, profit: 11100 },
    { month: 'Haziran', revenue: 19020, expenses: 5750, profit: 13270 }
  ],
  revenueByCategory: [
    { category: 'Saha Rezervasyonları', amount: 78350, percentage: 89.5 },
    { category: 'Kafeterya/Büfe', amount: 5120, percentage: 5.9 },
    { category: 'Ekipman Kiralama', amount: 2850, percentage: 3.3 },
    { category: 'Turnuva Gelirleri', amount: 1200, percentage: 1.3 }
  ],
  expensesByCategory: [
    { category: 'Personel Maaşları', amount: 12500, percentage: 45.5 },
    { category: 'Elektrik/Su/Doğalgaz', amount: 7200, percentage: 26.2 },
    { category: 'Saha Bakımı', amount: 4350, percentage: 15.8 },
    { category: 'Vergi/Sigorta', amount: 2100, percentage: 7.7 },
    { category: 'Diğer', amount: 1300, percentage: 4.8 }
  ],
  recentTransactions: [
    { id: 1, date: '2023-06-15', type: 'revenue', category: 'Saha Rezervasyonu', description: 'Ahmet Yılmaz - Saha 1', amount: 350 },
    { id: 2, date: '2023-06-15', type: 'revenue', category: 'Kafeterya', description: 'Satış Geliri', amount: 230 },
    { id: 3, date: '2023-06-16', type: 'expense', category: 'Personel Maaşı', description: 'Mehmet Yardımcı - Haziran Maaşı', amount: 4500 },
    { id: 4, date: '2023-06-17', type: 'revenue', category: 'Saha Rezervasyonu', description: 'Fatma Şahin - Saha 3', amount: 400 },
    { id: 5, date: '2023-06-17', type: 'expense', category: 'Elektrik Faturası', description: 'Haziran 2023', amount: 1850 },
    { id: 6, date: '2023-06-18', type: 'revenue', category: 'Saha Rezervasyonu', description: 'Hasan Kılıç - Saha 2', amount: 350 },
    { id: 7, date: '2023-06-19', type: 'expense', category: 'Bakım', description: 'Saha 1 Çim Bakımı', amount: 750 },
    { id: 8, date: '2023-06-20', type: 'revenue', category: 'Ekipman Kiralama', description: 'Futbol Topu x3', amount: 150 }
  ]
};

function AdminFinancialReports() {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [periodLabel, setPeriodLabel] = useState('Haziran 2023');
  
  // Veri yükleme
  useEffect(() => {
    const fetchData = async () => {
      try {
        // API çağrısı burada yapılacak
        // const response = await fetch(`http://localhost:5000/api/admin/financial?period=${period}`);
        // const data = await response.json();
        
        // Mock veri
        setTimeout(() => {
          setFinancialData(MOCK_FINANCIAL_DATA);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Finansal veri çekme hatası:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [period]);
  
  // Period değişimine göre etiket güncelleme
  useEffect(() => {
    switch (period) {
      case 'week':
        setPeriodLabel('Son Hafta (12-18 Haziran 2023)');
        break;
      case 'month':
        setPeriodLabel('Haziran 2023');
        break;
      case 'quarter':
        setPeriodLabel('2. Çeyrek 2023 (Nis-Haz)');
        break;
      case 'year':
        setPeriodLabel('2023 Yılı');
        break;
      default:
        setPeriodLabel('Haziran 2023');
    }
  }, [period]);
  
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
    setLoading(true);
  };
  
  const handleRefresh = () => {
    setLoading(true);
    // Veri yenileme işlemi burada yapılacak
    setTimeout(() => {
      setFinancialData(MOCK_FINANCIAL_DATA);
      setLoading(false);
    }, 1000);
  };
  
  const handleExportPDF = () => {
    alert('PDF raporu oluşturuluyor...');
    // PDF oluşturma ve indirme işlemi burada gerçekleştirilecek
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // Formatlayıcılar
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('tr-TR', { style: 'percent', maximumFractionDigits: 1 }).format(value / 100);
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
      {/* Başlık ve Araçlar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#333' }}>
          Finansal Raporlar
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Dönem</InputLabel>
            <Select
              value={period}
              label="Dönem"
              onChange={handlePeriodChange}
            >
              <MenuItem value="week">Son Hafta</MenuItem>
              <MenuItem value="month">Bu Ay</MenuItem>
              <MenuItem value="quarter">Bu Çeyrek</MenuItem>
              <MenuItem value="year">Bu Yıl</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Yenile">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="PDF İndir">
              <IconButton onClick={handleExportPDF} color="primary">
                <FileDownload />
              </IconButton>
            </Tooltip>
            <Tooltip title="Yazdır">
              <IconButton onClick={handlePrint} color="primary">
                <LocalPrintshop />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
        {periodLabel}
      </Typography>
      
      {/* Özet Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Toplam Gelir */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Toplam Gelir
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {formatCurrency(financialData.summary.totalRevenue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {financialData.summary.comparedToLastPeriod.revenue > 0 ? (
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5, color: '#FFFFFFCC' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, mr: 0.5, color: '#FFFFFFCC' }} />
                )}
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {Math.abs(financialData.summary.comparedToLastPeriod.revenue)}% {
                    financialData.summary.comparedToLastPeriod.revenue > 0 ? 'artış' : 'azalış'
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Toplam Gider */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Toplam Gider
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {formatCurrency(financialData.summary.expenses)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {financialData.summary.comparedToLastPeriod.expenses < 0 ? (
                  <TrendingDown sx={{ fontSize: 16, mr: 0.5, color: '#FFFFFFCC' }} />
                ) : (
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5, color: '#FFFFFFCC' }} />
                )}
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {Math.abs(financialData.summary.comparedToLastPeriod.expenses)}% {
                    financialData.summary.comparedToLastPeriod.expenses < 0 ? 'azalış' : 'artış'
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Net Kar */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Net Kar
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {formatCurrency(financialData.summary.profit)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {financialData.summary.comparedToLastPeriod.profit > 0 ? (
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5, color: '#FFFFFFCC' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, mr: 0.5, color: '#FFFFFFCC' }} />
                )}
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {Math.abs(financialData.summary.comparedToLastPeriod.profit)}% {
                    financialData.summary.comparedToLastPeriod.profit > 0 ? 'artış' : 'azalış'
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Kar Marjı */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Kar Marjı
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {formatPercentage((financialData.summary.profit / financialData.summary.totalRevenue) * 100)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Toplam gelirin {formatPercentage((financialData.summary.profit / financialData.summary.totalRevenue) * 100)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Gelir Dağılımı */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Gelir Dağılımı
              </Typography>
              <CategoryOutlined color="primary" />
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Tutar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Oran</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financialData.revenueByCategory.map((item) => (
                    <TableRow key={item.category} hover>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {item.category}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(item.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatPercentage(item.percentage)}
                          </Typography>
                          <Box
                            sx={{
                              ml: 1,
                              width: 40,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#4CAF50',
                              opacity: item.percentage / 100
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Gider Dağılımı */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Gider Dağılımı
              </Typography>
              <CategoryOutlined color="error" />
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Tutar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Oran</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financialData.expensesByCategory.map((item) => (
                    <TableRow key={item.category} hover>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {item.category}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(item.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatPercentage(item.percentage)}
                          </Typography>
                          <Box
                            sx={{
                              ml: 1,
                              width: 40,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#F44336',
                              opacity: item.percentage / 100
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Aylık Gelir/Gider Grafiği */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Aylık Gelir/Gider Tablosu
              </Typography>
              <CalendarMonth color="primary" />
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ay</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Gelir</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Gider</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Net Kar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Kar Marjı</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financialData.revenueByMonth.map((item) => (
                    <TableRow key={item.month} hover>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {item.month}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          color="success.main"
                        >
                          {formatCurrency(item.revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          color="error.main"
                        >
                          {formatCurrency(item.expenses)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={item.profit > 0 ? 'primary.main' : 'error.main'}
                        >
                          {formatCurrency(item.profit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatPercentage((item.profit / item.revenue) * 100)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Son İşlemler */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Son İşlemler
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<Visibility />}
                sx={{ borderRadius: 8 }}
              >
                Tüm İşlemler
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Açıklama</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Tutar</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Tür</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financialData.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(transaction.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {transaction.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.category}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          color={transaction.type === 'revenue' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'revenue' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={transaction.type === 'revenue' ? 'Gelir' : 'Gider'} 
                          size="small" 
                          color={transaction.type === 'revenue' ? 'success' : 'error'} 
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminFinancialReports; 