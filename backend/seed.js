const mongoose = require('mongoose');
const User = require('./models/User');
const Video = require('./models/Video');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample user data
const users = [
  {
    username: 'futbolcu1',
    email: 'futbolcu1@example.com',
    password: 'password123',
    firstName: 'Ali',
    lastName: 'Yılmaz',
    profilePicture: '/uploads/images/default-profile.png',
    bio: 'Futbol tutkunu, orta saha oyuncusu',
    position: 'Orta Saha',
    height: 178,
    weight: 75,
    preferredFoot: 'Sağ',
    favoriteTeam: 'Galatasaray',
    location: 'İstanbul'
  },
  {
    username: 'futbolcu2',
    email: 'futbolcu2@example.com',
    password: 'password123',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    profilePicture: '/uploads/images/default-profile.png',
    bio: 'Kaleci, 10 yıllık deneyim',
    position: 'Kaleci',
    height: 188,
    weight: 82,
    preferredFoot: 'Sol',
    favoriteTeam: 'Fenerbahçe',
    location: 'Ankara'
  }
];

// Sample video data
const videos = [
  {
    title: 'FutbolX Turnuvası Final Maçı',
    description: '2024 FutbolX Turnuvası final maçı özeti',
    fileName: 'sample-video-1.mp4',
    filePath: '/uploads/videos/sample-video-1.mp4',
    postType: 'video',
    category: 'maç',
    tags: ['maç', 'turnuva', 'final', 'futbolx'],
    isPublic: true,
    views: 120,
    likes: 24
  },
  {
    title: 'Serbest Vuruş Tekniği',
    description: 'Profesyonel futbolcudan serbest vuruş teknikleri',
    fileName: 'sample-video-2.mp4',
    filePath: '/uploads/videos/sample-video-2.mp4',
    postType: 'video',
    category: 'antrenman',
    tags: ['antrenman', 'teknik', 'serbest vuruş'],
    isPublic: true,
    views: 85,
    likes: 15
  },
  {
    title: 'Haftalık Futbol Analizi',
    description: 'Bu haftanın en iyi futbol hareketleri ve analizleri',
    textContent: 'Bu haftasonu oynanan maçlarda birçok ilginç taktik varyasyon gördük. Özellikle orta saha presingi yapan takımlar rakiplerini baskı altına almayı başardı. Forvet bölgesinde ise dar alanda oynayan takımlar daha çok gol fırsatı yakaladı.',
    postType: 'text',
    category: 'diğer',
    tags: ['analiz', 'taktik', 'futbol'],
    isPublic: true,
    views: 65,
    likes: 12
  },
  {
    title: 'Özel Halı Saha Turnuvası',
    description: 'Halı saha turnuvamızdan görüntüler',
    fileName: 'sample-image-1.jpg',
    filePath: '/uploads/images/sample-image-1.jpg',
    postType: 'image',
    category: 'maç',
    tags: ['turnuva', 'halı saha', 'etkinlik'],
    isPublic: true,
    views: 43,
    likes: 8
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Video.deleteMany({});
    
    console.log('Database cleared');
    
    // Create sample users
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = new User({
        ...user,
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
      console.log(`User created: ${savedUser.username}`);
    }
    
    // Create sample videos
    for (const video of videos) {
      const randomUserIndex = Math.floor(Math.random() * createdUsers.length);
      
      const newVideo = new Video({
        ...video,
        uploadedBy: createdUsers[randomUserIndex]._id
      });
      
      const savedVideo = await newVideo.save();
      console.log(`Video created: ${savedVideo.title}`);
    }
    
    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 