import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

// Temel Bileşenler
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';

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
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/About';
import CreateTeamPage from './pages/CreateTeamPage';
import ReviewsPage from './pages/ReviewsPage';

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

// Ana uygulama içeriği bileşeni
const AppContent = () => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();

  // Kullanıcı profil bilgilerini yükle
  useEffect(() => {
    const loadUserProfile = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            setUserProfile(JSON.parse(userData));
          } catch (error) {
            console.error('Kullanıcı profili yüklenirken hata:', error);
          }
        }
      }
    };

    loadUserProfile();
  }, []);

  // Mevcut sayfa adını belirle
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/reservations')) return 'reservation';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/teams')) return 'teams';
    if (path.includes('/matches')) return 'matches';
    if (path.includes('/videos')) return 'videos';
    if (path.includes('/stats')) return 'stats';
    return 'home';
  };

  const toggleAI = () => {
    setIsAIOpen(!isAIOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10 }}>
        <Container maxWidth="lg">
          <Routes>
            {/* Herkese açık sayfalar */}
            <Route path="/" element={<Feed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<AboutPage />} />
            
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
            <Route path="/teams/create" element={
              <ProtectedRoute>
                <CreateTeamPage />
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
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reviews/:facilityId" element={<ReviewsPage />} />
            
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
      
      {/* AI Assistant - Tüm sayfalarda görünür */}
      <AIAssistant
        isOpen={isAIOpen}
        onToggle={toggleAI}
        userProfile={userProfile}
        currentPage={getCurrentPage()}
      />
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
        <Router>
          <AppContent />
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
