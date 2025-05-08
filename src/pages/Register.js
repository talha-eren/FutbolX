import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    position: '',
    favoriteTeam: '',
    height: '',
    weight: '',
    preferredFoot: 'Sağ',
    birthDate: '',
    location: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      navigate('/profile');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert(error.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
    }
  };

  return (
    <div className="register-form-container">
      <h2>FutbolX'e Kayıt Ol</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-section">
          <h3>Hesap Bilgileri</h3>
          <div className="form-group">
            <label>Kullanıcı Adı:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>E-posta:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Şifre:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Kişisel Bilgiler</h3>
          <div className="form-group">
            <label>Ad:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Soyad:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Doğum Tarihi:</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Konum:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              placeholder="Şehir, Ülke"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Futbol Bilgileri</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Boy (cm):</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                min="0"
                placeholder="175"
              />
            </div>

            <div className="form-group">
              <label>Kilo (kg):</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="0"
                placeholder="70"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Pozisyon:</label>
            <select name="position" value={formData.position} onChange={handleInputChange}>
              <option value="">Seçiniz</option>
              <option value="Kaleci">Kaleci</option>
              <option value="Defans">Defans</option>
              <option value="Orta Saha">Orta Saha</option>
              <option value="Forvet">Forvet</option>
            </select>
          </div>

          <div className="form-group">
            <label>Favori Takım:</label>
            <input
              type="text"
              name="favoriteTeam"
              value={formData.favoriteTeam}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Tercih Edilen Ayak:</label>
            <select name="preferredFoot" value={formData.preferredFoot} onChange={handleInputChange}>
              <option value="Sağ">Sağ</option>
              <option value="Sol">Sol</option>
              <option value="Her İkisi">Her İkisi</option>
            </select>
          </div>
        </div>

        <button type="submit" className="register-button">Kayıt Ol</button>
      </form>
    </div>
  );
};

export default Register; 