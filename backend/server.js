const express = require('express');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const questionRoutes = require('./routes/questionRoutes');
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// CORS middleware đơn giản và hiệu quả
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

connectDB();

// Ensure uploads directory exists and serve static files
const uploadsDir = path.join(__dirname, 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir); } catch {}
try { if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir); } catch {}
app.use('/uploads', express.static(uploadsDir));

app.use('/api/questions', questionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/admin', adminRoutes);

app.listen(process.env.PORT || 5000, () => {
  
});