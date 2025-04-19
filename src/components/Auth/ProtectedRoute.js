import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Korumalı sayfa bileşeni
 * Giriş yapılmadıysa login sayfasına yönlendirir, current path'i query param olarak ekler
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    // Kullanıcının erişmek istediği sayfanın yolunu query param olarak ekle
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />;
  }

  return children;
};

export default ProtectedRoute;
