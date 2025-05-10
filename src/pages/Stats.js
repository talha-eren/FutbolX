import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Card, CardContent,
  Grid, Paper, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// API URL
const API_URL = 'http://localhost:5000/api';

function Stats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState({
    matches: 0,
    goals: 0,
    assists: 0,
    position: '',
    preferredFoot: '',
    height: 0,
    weight: 0,
    teams: [],
    achievements: []
  });
  
  // Token'ı localStorage'dan al
  const getToken = () => {
    return localStorage.getItem('userToken');
  };
  
  // API isteği için config oluştur
  const getConfig = () => {
    const token = getToken();
    if (!token) {
      console.error('Token bulunamadı');
      return null;
    }
    
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  };
  
  // İstatistik verilerini çek
  const fetchStats = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      
      if (!config) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/auth/profile`, config);
      
      // İstatistikleri ayarla
      setUserStats({
        matches: response.data.matchesPlayed || 0,
        goals: response.data.goalsScored || 0,
        assists: response.data.assists || 0,
        position: response.data.position || '',
        preferredFoot: response.data.preferredFoot || '',
        height: response.data.height || 0,
        weight: response.data.weight || 0,
        teams: response.data.teams || [],
        achievements: response.data.achievements || []
      });
      
      setLoading(false);
    } catch (error) {
      console.error('İstatistik verileri çekilirken hata oluştu:', error);
      
      if (error.response && error.response.status === 401) {
        setError('Oturumunuz sonlanmış görünüyor. Lütfen tekrar giriş yapın.');
        // Token'ı temizle ve kullanıcıyı login sayfasına yönlendir
        localStorage.removeItem('userToken');
        localStorage.removeItem('isLoggedIn');
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login?redirect=/stats';
        }, 2000);
      } else {
        setError('İstatistik verileri yüklenirken bir hata oluştu.');
      }
      
      setLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde kullanıcı istatistiklerini çek
  useEffect(() => {
    fetchStats();
  }, []);
  
  // Grafik verilerini hazırla
  const prepareChartData = () => {
    return [
      {
        name: 'Maç',
        değer: userStats.matches,
        dolgu: '#8884d8',
      },
      {
        name: 'Gol',
        değer: userStats.goals,
        dolgu: '#4CAF50',
      },
      {
        name: 'Asist',
        değer: userStats.assists,
        dolgu: '#ffc658',
      }
    ];
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Typography variant="h4" component="h1" color="primary" gutterBottom sx={{ 
        fontWeight: 'bold',
        mb: 3,
        borderBottom: '2px solid #4CAF50',
        pb: 1
      }}>
        İstatistiklerim
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* İstatistik Grafiği */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Performans Özetim
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={prepareChartData()}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="değer" fill="#4CAF50" name="Değer" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
          
          {/* İstatistik Kartları */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#4CAF50' }}>
                  Maç İstatistikleri
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Oynadığım Maçlar:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.matches}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Attığım Goller:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.goals}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Asistlerim:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.assists}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Gol/Maç Oranı:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.matches > 0 ? (userStats.goals / userStats.matches).toFixed(2) : '0'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#4CAF50' }}>
                  Futbolcu Bilgilerim
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Pozisyon:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.position || 'Belirtilmemiş'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Tercih Ettiğim Ayak:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.preferredFoot || 'Belirtilmemiş'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Boy:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.height || 0} cm</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Kilo:</Typography>
                    <Typography variant="body1" fontWeight="bold">{userStats.weight || 0} kg</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#4CAF50' }}>
                  Gelişim Analizi
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Güçlü Yönlerim:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.goals > userStats.assists ? 'Gol Atmak' : 'Asist Yapmak'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Geliştirilmesi Gereken:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.goals < userStats.assists ? 'Gol Atmak' : 'Asist Yapmak'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="text.secondary">Verimlilik:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {userStats.matches > 0 ? ((userStats.goals + userStats.assists) / userStats.matches).toFixed(2) : '0'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default Stats; 