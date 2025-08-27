const { getPool } = require('../config/db');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const pool = await getPool();
    const checkUser = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM [dbo].[Users] WHERE Email = @email');

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const result = await pool.request()
      .input('fullName', sql.VarChar, fullName)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .query(`
        INSERT INTO [dbo].[Users] (Username, Email, Password, Role, FullName, CreatedAt, UpdatedAt, IsActive)
        OUTPUT INSERTED.Id, INSERTED.Username, INSERTED.Email, INSERTED.Role, INSERTED.FullName
        VALUES (@fullName, @email, @password, 'user', @fullName, GETDATE(), GETDATE(), 1)
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const token = jwt.sign(
        { userId: user.Id, email: user.Email, role: user.Role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.status(201).json({
        message: 'Đăng ký thành công',
        user: {
          id: user.Id,
          email: user.Email,
          fullName: user.FullName || user.Username,
          role: user.Role
        },
        token
      });
    } else {
      res.status(500).json({ message: 'Lỗi tạo tài khoản' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền email và mật khẩu' });
    }

    const pool = await getPool();
    const users = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM [dbo].[Users] WHERE Email = @email');

    if (users.recordset.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const user = users.recordset[0];
    const isPasswordValid = password === user.Password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { userId: user.Id, email: user.Email, role: user.Role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.Id,
        email: user.Email,
        fullName: user.Username,
        role: user.Role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pool = await getPool();
    const users = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT Id, Username, Email, Role, FullName, Phone, DateOfBirth, 
               Gender, Address, IDCard, ProfileImage, HasLicense, 
               LicenseScore, LicenseClass, LicenseDate, CreatedAt
        FROM [dbo].[Users] WHERE Id = @userId
      `);

    if (users.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const user = users.recordset[0];
    res.json({
      user: {
        id: user.Id,
        username: user.Username,
        email: user.Email,
        fullName: user.FullName,
        role: user.Role,
        phone: user.Phone,
        dateOfBirth: user.DateOfBirth,
        gender: user.Gender,
        address: user.Address,
        idCard: user.IDCard,
        profileImage: user.ProfileImage,
        hasLicense: user.HasLicense,
        licenseScore: user.LicenseScore,
        licenseClass: user.LicenseClass,
        licenseDate: user.LicenseDate,
        createdAt: user.CreatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Logout user (client-side token removal)
const logout = async (req, res) => {
  try {
    // JWT tokens are stateless, so we just return success
    // Client should remove the token from localStorage
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout
};

// Avatar upload controller (multer handles file)
module.exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file tải lên' });
    }

    const userId = req.user.userId;
    const pool = await getPool();

    // Optional: get old avatar to delete
    const existing = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT ProfileImage FROM [dbo].[Users] WHERE Id = @userId');
    const oldPath = existing.recordset?.[0]?.ProfileImage || '';

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('profileImage', sql.VarChar, avatarPath)
      .query('UPDATE [dbo].[Users] SET ProfileImage = @profileImage, UpdatedAt = GETDATE() WHERE Id = @userId');

    // Optionally delete old file if it exists and in our uploads dir
    if (oldPath && oldPath.startsWith('/uploads/')) {
      const fullOld = path.join(__dirname, '..', oldPath);
      fs.unlink(fullOld, () => {});
    }

    return res.json({ message: 'ok', profileImage: avatarPath });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
