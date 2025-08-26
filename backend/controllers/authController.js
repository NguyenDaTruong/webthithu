const { getPool } = require('../config/db');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.request()
      .input('fullName', sql.VarChar, fullName)
      .input('email', sql.VarChar, email)
      .input('hashedPassword', sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO [dbo].[Users] (Username, Email, Password, Role)
        OUTPUT INSERTED.Id, INSERTED.Username, INSERTED.Email, INSERTED.Role
        VALUES (@fullName, @email, @hashedPassword, 'user')
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const token = jwt.sign(
        { userId: user.Id, email: user.Email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.status(201).json({
        message: 'Đăng ký thành công',
        user: {
          id: user.Id,
          email: user.Email,
          fullName: user.Username,
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
    let isPasswordValid = false;

    try {
      isPasswordValid = await bcrypt.compare(password, user.Password);
    } catch (bcryptError) {
      isPasswordValid = password === user.Password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { userId: user.Id, email: user.Email },
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
      .query('SELECT Id, Username, Email, Role FROM [dbo].[Users] WHERE Id = @userId');

    if (users.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const user = users.recordset[0];
    res.json({
      user: {
        id: user.Id,
        email: user.Email,
        fullName: user.Username,
        role: user.Role
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
