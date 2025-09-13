const { getPool } = require('../config/db');
const sql = require('mssql');

// Dashboard Overview
exports.getDashboardStats = async (req, res) => {
  try {
    const pool = await getPool();
    
    // Lấy thống kê tổng quan
    const stats = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM [dbo].[Users] WHERE Role = 'user') as totalUsers,
        (SELECT COUNT(*) FROM [dbo].[Users] WHERE Role = 'user') as activeUsers,
        (SELECT COUNT(*) FROM [dbo].[Questions]) as totalQuestions,
        (SELECT COUNT(*) FROM [dbo].[Certificates] WHERE isPassed = 1) as totalCertificates,
        (SELECT COUNT(*) FROM [dbo].[Certificates] WHERE isPassed = 0) as failedAttempts
    `);

    res.json({
      success: true,
      data: {
        overview: stats.recordset[0],
        weeklyStats: []
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// User Management
exports.getUsers = async (req, res) => {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT Id, Username, Email, FullName, Role, CreatedAt
      FROM [dbo].[Users] 
      ORDER BY CreatedAt DESC
    `);

    res.json({
      success: true,
      data: {
        users: result.recordset,
        pagination: {
          page: 1,
          limit: 10,
          total: result.recordset.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    
    const user = await pool.request()
      .input('userId', sql.Int, id)
      .query(`
        SELECT Id, Username, Email, FullName, Role, CreatedAt
        FROM [dbo].[Users] WHERE Id = @userId
      `);

    if (user.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({
      success: true,
      data: {
        user: user.recordset[0],
        certificates: []
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, fullName, role = 'user' } = req.body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Email, password và fullName là bắt buộc' });
    }

    const pool = await getPool();
    
    // Kiểm tra email đã tồn tại
    const existingUser = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT Id FROM [dbo].[Users] WHERE Email = @email');
    
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    // Tạo user mới
    const result = await pool.request()
      .input('fullName', sql.VarChar, fullName)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .input('role', sql.VarChar, role)
      .query(`
        INSERT INTO [dbo].[Users] (Username, Email, Password, Role, FullName, CreatedAt)
        OUTPUT INSERTED.Id, INSERTED.Username, INSERTED.Email, INSERTED.Role, INSERTED.FullName
        VALUES (@fullName, @email, @password, @role, @fullName, GETDATE())
      `);

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role } = req.body;
    
    const pool = await getPool();
    
    // Kiểm tra user có tồn tại
    const existingUser = await pool.request()
      .input('userId', sql.Int, id)
      .query('SELECT Id FROM [dbo].[Users] WHERE Id = @userId');
    
    if (existingUser.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật thông tin
    await pool.request()
      .input('userId', sql.Int, id)
      .input('fullName', sql.VarChar, fullName)
      .input('role', sql.VarChar, role)
      .query(`
        UPDATE [dbo].[Users] 
        SET FullName = @fullName, Role = @role
        WHERE Id = @userId
      `);

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    res.json({
      success: true,
      message: `Đã ${isActive ? 'kích hoạt' : 'khóa'} tài khoản người dùng`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'user', 'moderator'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role không hợp lệ' });
    }
    
    const pool = await getPool();
    
    await pool.request()
      .input('userId', sql.Int, id)
      .input('role', sql.VarChar, role)
      .query('UPDATE [dbo].[Users] SET Role = @role WHERE Id = @userId');

    res.json({
      success: true,
      message: 'Cập nhật role thành công'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await getPool();
    
    // Kiểm tra user có tồn tại
    const existingUser = await pool.request()
      .input('userId', sql.Int, id)
      .query('SELECT Role FROM [dbo].[Users] WHERE Id = @userId');
    
    if (existingUser.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Không cho phép xóa admin
    if (existingUser.recordset[0].Role === 'admin') {
      return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản admin' });
    }

    // Xóa user
    await pool.request()
      .input('userId', sql.Int, id)
      .query('DELETE FROM [dbo].[Users] WHERE Id = @userId');

    res.json({
      success: true,
      message: 'Đã xóa người dùng'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Question Management
exports.getQuestions = async (req, res) => {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT Id, QuestionText, OptionA, OptionB, OptionC, OptionD, 
             CorrectAnswer, Category, Explanation
      FROM [dbo].[Questions] 
      ORDER BY Id DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT Id, QuestionText, OptionA, OptionB, OptionC, OptionD, 
               CorrectAnswer, Category, Explanation
        FROM [dbo].[Questions] WHERE Id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Get question by ID error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { 
      questionText, optionA, optionB, optionC, optionD, 
      correctAnswer, category, explanation
    } = req.body;
    
    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer || !category) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    const pool = await getPool();
    
    const result = await pool.request()
      .input('questionText', sql.NVarChar, questionText)
      .input('optionA', sql.NVarChar, optionA)
      .input('optionB', sql.NVarChar, optionB)
      .input('optionC', sql.NVarChar, optionC)
      .input('optionD', sql.NVarChar, optionD)
      .input('correctAnswer', sql.VarChar, correctAnswer)
      .input('category', sql.VarChar, category)
      .input('explanation', sql.NVarChar, explanation || null)
      .query(`
        INSERT INTO [dbo].[Questions] (
          QuestionText, OptionA, OptionB, OptionC, OptionD, 
          CorrectAnswer, Category, Explanation
        )
        OUTPUT INSERTED.Id, INSERTED.QuestionText, INSERTED.Category
        VALUES (
          @questionText, @optionA, @optionB, @optionC, @optionD, 
          @correctAnswer, @category, @explanation
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Tạo câu hỏi thành công',
      data: result.recordset[0]
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      questionText, optionA, optionB, optionC, optionD, 
      correctAnswer, category, explanation
    } = req.body;
    
    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer || !category) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    const pool = await getPool();
    
    // Kiểm tra câu hỏi có tồn tại
    const existingQuestion = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Id FROM [dbo].[Questions] WHERE Id = @id');
    
    if (existingQuestion.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    }

    // Cập nhật câu hỏi
    await pool.request()
      .input('id', sql.Int, id)
      .input('questionText', sql.NVarChar, questionText)
      .input('optionA', sql.NVarChar, optionA)
      .input('optionB', sql.NVarChar, optionB)
      .input('optionC', sql.NVarChar, optionC)
      .input('optionD', sql.NVarChar, optionD)
      .input('correctAnswer', sql.VarChar, correctAnswer)
      .input('category', sql.VarChar, category)
      .input('explanation', sql.NVarChar, explanation || null)
      .query(`
        UPDATE [dbo].[Questions] 
        SET QuestionText = @questionText, 
            OptionA = @optionA, 
            OptionB = @optionB, 
            OptionC = @optionC, 
            OptionD = @optionD, 
            CorrectAnswer = @correctAnswer, 
            Category = @category,
            Explanation = @explanation
        WHERE Id = @id
      `);

    res.json({
      success: true,
      message: 'Cập nhật câu hỏi thành công'
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await getPool();
    
    // Kiểm tra câu hỏi có tồn tại
    const existingQuestion = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Id FROM [dbo].[Questions] WHERE Id = @id');
    
    if (existingQuestion.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    }

    // Xóa câu hỏi
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM [dbo].[Questions] WHERE Id = @id');

    res.json({
      success: true,
      message: 'Đã xóa câu hỏi'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Category Management
exports.getCategories = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] 
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Exam Management
exports.getExams = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Exam management - Coming soon' 
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Practice Exam Management
exports.getPracticeExams = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Practice exam management - Coming soon' 
    });
  } catch (error) {
    console.error('Get practice exams error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
