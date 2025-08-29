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

// Change password
const changePassword = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const pool = await getPool();
    
    // Verify current password
    const user = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT Password FROM [dbo].[Users] WHERE Id = @userId');

    if (user.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.recordset[0].Password !== currentPassword) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Update password
    await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .input('newPassword', sql.VarChar, newPassword)
      .query('UPDATE [dbo].[Users] SET Password = @newPassword, UpdatedAt = GETDATE() WHERE Id = @userId');

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Forgot password - Verify personal information and generate reset token
const forgotPassword = async (req, res) => {
  try {
    const { email, phone, idCard, dateOfBirth } = req.body;

    if (!email || !phone || !idCard || !dateOfBirth) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin: Email, Số điện thoại, CCCD/CMND, Ngày sinh' });
    }

    const pool = await getPool();
    
    // Check if user exists with all provided information
    const user = await pool.request()
      .input('email', sql.VarChar, email)
      .input('phone', sql.VarChar, phone)
      .input('idCard', sql.VarChar, idCard)
      .input('dateOfBirth', sql.Date, new Date(dateOfBirth))
      .query(`
        SELECT Id, Email, Phone, IDCard, DateOfBirth, Username, FullName
        FROM [dbo].[Users] 
        WHERE Email = @email 
          AND Phone = @phone 
          AND IDCard = @idCard 
          AND CAST(DateOfBirth AS DATE) = @dateOfBirth
          AND IsActive = 1
      `);

    if (user.recordset.length === 0) {
      return res.status(400).json({ message: 'Thông tin xác thực không chính xác. Vui lòng kiểm tra lại Email, Số điện thoại, CCCD/CMND và Ngày sinh.' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.recordset[0].Id, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await pool.request()
      .input('userId', sql.Int, user.recordset[0].Id)
      .input('resetToken', sql.VarChar, resetToken)
      .input('resetExpires', sql.DateTime, new Date(Date.now() + 60 * 60 * 1000)) // 1 hour
      .query(`
        UPDATE [dbo].[Users] 
        SET ResetToken = @resetToken, ResetTokenExpires = @resetExpires, UpdatedAt = GETDATE() 
        WHERE Id = @userId
      `);

    // Trả về thông tin user đã xác thực để frontend có thể hiển thị form đổi mật khẩu
    res.json({ 
      message: 'Xác thực thành công! Bạn có thể đặt lại mật khẩu ngay bây giờ.',
      success: true,
      user: {
        id: user.recordset[0].Id,
        email: user.recordset[0].Email,
        username: user.recordset[0].Username,
        fullName: user.recordset[0].FullName
      },
      resetToken: resetToken, // Để sử dụng cho API reset password
      note: 'Trong môi trường production, token sẽ được gửi qua email. Hiện tại bạn có thể đổi mật khẩu trực tiếp.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({ message: 'Token không hợp lệ' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Token đã hết hạn hoặc không hợp lệ' });
    }

    const pool = await getPool();
    
    // Check if token exists and is valid
    const user = await pool.request()
      .input('userId', sql.Int, decoded.userId)
      .input('resetToken', sql.VarChar, resetToken)
      .query(`
        SELECT Id, ResetTokenExpires 
        FROM [dbo].[Users] 
        WHERE Id = @userId AND ResetToken = @resetToken AND IsActive = 1
      `);

    if (user.recordset.length === 0) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    const resetExpires = new Date(user.recordset[0].ResetTokenExpires);
    if (resetExpires < new Date()) {
      return res.status(400).json({ message: 'Token đã hết hạn' });
    }

    // Update password and clear reset token
    await pool.request()
      .input('userId', sql.Int, decoded.userId)
      .input('newPassword', sql.VarChar, newPassword)
      .query(`
        UPDATE [dbo].[Users] 
        SET Password = @newPassword, ResetToken = NULL, ResetTokenExpires = NULL, UpdatedAt = GETDATE() 
        WHERE Id = @userId
      `);

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
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
    
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Update current user profile
module.exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.userId;
    const {
      username,
      email,
      fullName,
      phone,
      dateOfBirth,
      gender,
      address,
      idCard
    } = req.body || {};

    

    const pool = await getPool();

    // Build dynamic update with provided fields only
    // For simplicity and clarity, update expected editable fields
    const request = pool.request()
      .input('userId', sql.Int, userId)
      .input('username', sql.VarChar, username || null)
      .input('email', sql.VarChar, email || null)
      .input('fullName', sql.VarChar, fullName || null)
      .input('phone', sql.VarChar, phone || null)
      .input('gender', sql.VarChar, gender || null)
      .input('address', sql.VarChar, address || null)
      .input('idCard', sql.VarChar, idCard || null)
      .input('dateOfBirth', sql.DateTime, dateOfBirth ? new Date(dateOfBirth) : null);

    const updateResult = await request.query(`UPDATE [dbo].[Users]
      SET Username = COALESCE(@username, Username),
          Email = COALESCE(@email, Email),
          FullName = COALESCE(@fullName, FullName),
          Phone = COALESCE(@phone, Phone),
          DateOfBirth = CASE WHEN @dateOfBirth IS NULL THEN DateOfBirth ELSE @dateOfBirth END,
          Gender = COALESCE(@gender, Gender),
          Address = COALESCE(@address, Address),
          IDCard = COALESCE(@idCard, IDCard),
          UpdatedAt = GETDATE()
      WHERE Id = @userId`);

    

    // Return updated profile
    const users = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT Id, Username, Email, Role, FullName, Phone, DateOfBirth, 
                     Gender, Address, IDCard, ProfileImage, HasLicense, 
                     LicenseScore, LicenseClass, LicenseDate, CreatedAt
              FROM [dbo].[Users] WHERE Id = @userId`);

    if (!users.recordset || users.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const user = users.recordset[0];
    return res.json({
      message: 'Cập nhật thành công',
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
    
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
