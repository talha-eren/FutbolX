import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

// Temel Bileşenler
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Sayfa Bileşenleri
import Feed from './components/Feed';
import MatchResults from './components/MatchResults';
import Teams from './components/Teams';
import Reservation from './components/Reservation';
import Profile from './components/Profile';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

// Video Bileşenleri
import VideoList from './components/Video/VideoList';
import VideoDetail from './components/Video/VideoDetail';
import UploadPost from './components/Video/UploadVideo';

// Özel tema oluşturma
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#fff',
    },
    secondary: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
      contrastText: '#fff',
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

// Misafir kullanıcıları kontrol etmek için yardımcı bileşen
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('userToken');
  const location = window.location.pathname;
  
  console.log('Korumalı rota kontrolü:', { isLoggedIn, token: !!token, location });
  
  if (!isLoggedIn || !token) {
    // Kullanıcı giriş yapmamışsa, mevcut konumu redirect parametresi olarak ekleyerek
    // login sayfasına yönlendir
    console.log('Kullanıcı giriş yapmamış, giriş sayfasına yönlendiriliyor');
    return <Navigate to={`/login?redirect=${encodeURIComponent(location)}`} replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, py: 10 }}>
              <Container maxWidth="lg">
                <Routes>
                  {/* Herkese açık sayfalar */}
                  <Route path="/" element={<Feed />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Sadece giriş yapmış kullanıcılara özel sayfalar */}
                  <Route path="/matches" element={
                    <ProtectedRoute>
                      <MatchResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/teams" element={
                    <ProtectedRoute>
                      <Teams />
                    </ProtectedRoute>
                  } />
                  <Route path="/reservations" element={
                    <ProtectedRoute>
                      <Reservation />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/stats" element={
                    <ProtectedRoute>
                      <Stats />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  
                  {/* Video Rotaları */}
                  <Route path="/videos" element={<VideoList />} />
                  <Route path="/videos/:id" element={<VideoDetail />} />
                  <Route path="/upload-post" element={
                    <ProtectedRoute>
                      <UploadPost />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Container>
            </Box>
            <Footer />
          </Box>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
