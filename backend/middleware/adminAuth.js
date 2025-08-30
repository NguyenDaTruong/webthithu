const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const sql = require('mssql');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Kiểm tra user có tồn tại và có role admin không
    const pool = await getPool();
    const user = await pool.request()
      .input('userId', sql.Int, decoded.userId)
      .query('SELECT Id, Email, Role, IsActive FROM [dbo].[Users] WHERE Id = @userId');

    if (user.recordset.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const userData = user.recordset[0];
    
    if (!userData.IsActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    if (userData.Role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = decoded;
    req.adminUser = userData;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Admin auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { authenticateAdmin };
