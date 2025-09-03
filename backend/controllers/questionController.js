const { getPool } = require('../config/db');
const sql = require('mssql');

// Kiểm tra cấu trúc bảng Questions
exports.checkTableStructure = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Questions'
      ORDER BY ORDINAL_POSITION
    `);
    
    res.json({
      success: true,
      columns: result.recordset
    });
  } catch (err) {
    console.error('Check table structure error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Kiểm tra dữ liệu trong bảng Questions
exports.checkTableData = async (req, res) => {
  try {
    const pool = await getPool();
    
    // Kiểm tra tổng số câu hỏi
    const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM [dbo].[Questions]');
    const total = totalResult.recordset[0].total;
    
    // Kiểm tra các category có sẵn
    const categoryResult = await pool.request().query(`
      SELECT Category, COUNT(*) as count 
      FROM [dbo].[Questions] 
      GROUP BY Category 
      ORDER BY Category
    `);
    
    // Kiểm tra 5 câu hỏi đầu tiên
    const sampleResult = await pool.request().query(`
      SELECT TOP 5 Id, QuestionText, Category, IsCritical
      FROM [dbo].[Questions]
      ORDER BY Id
    `);
    
    res.json({
      success: true,
      totalQuestions: total,
      categories: categoryResult.recordset,
      sampleQuestions: sampleResult.recordset
    });
  } catch (err) {
    console.error('Check table data error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM [dbo].[Questions]');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm vào questionController.js
exports.getRandomQuestions = async (req, res) => {
  try {
    const { count = 25, category = 'AnToanGiaoThong' } = req.query;
    
    const pool = await getPool();
    const result = await pool.request()
      .input('count', sql.Int, parseInt(count))
      .input('category', sql.VarChar, category)
      .query(`
        SELECT TOP (@count) Id, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer
        FROM [dbo].[Questions] 
        WHERE Category = @category
        ORDER BY NEWID()
      `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo đề thi mới với câu hỏi random và đáp án xáo trộn
exports.createExam = async (req, res) => {
  try {
    const { 
      examType = 'practice', // 'practice' hoặc 'official'
      questionCount = 25, 
      category = 'AnToanGiaoThong',
      timeLimit = 20, // phút
      shuffleAnswers = true,
      includeCritical = true,
      minCriticalQuestions = 0 // Số câu điểm liệt tối thiểu (chỉ áp dụng cho thi thật)
    } = req.body;

    const pool = await getPool();
    
    // Debug: Log thông tin request
    console.log('Create exam request:', { examType, questionCount, category, timeLimit, shuffleAnswers, includeCritical, minCriticalQuestions });
    
    // Lấy câu hỏi theo điều kiện
    let query = `
      SELECT TOP (@count) 
        Id, QuestionText, OptionA, OptionB, OptionC, OptionD, 
        CorrectAnswer, IsCritical, Category
      FROM [dbo].[Questions] 
      WHERE Category = @category
    `;
    
    // Logic khác nhau cho thi thử và thi thật
    if (examType === 'official' && minCriticalQuestions > 0) {
      // Thi thật: Đảm bảo có ít nhất minCriticalQuestions câu điểm liệt
      query = `
        WITH CriticalQuestions AS (
          SELECT TOP (@minCriticalQuestions) Id, QuestionText, OptionA, OptionB, OptionC, OptionD, 
                 CorrectAnswer, IsCritical, Category
          FROM [dbo].[Questions] 
          WHERE Category = @category AND IsCritical = 1
          ORDER BY NEWID()
        ),
        RegularQuestions AS (
          SELECT TOP (@count - @minCriticalQuestions) Id, QuestionText, OptionA, OptionB, OptionC, OptionD, 
                 CorrectAnswer, IsCritical, Category
          FROM [dbo].[Questions] 
          WHERE Category = @category AND IsCritical = 0
          ORDER BY NEWID()
        )
        SELECT * FROM CriticalQuestions
        UNION ALL
        SELECT * FROM RegularQuestions
        ORDER BY NEWID()
      `;
    } else if (includeCritical) {
      // Thi thử: Ưu tiên câu điểm liệt nhưng không bắt buộc
      query = `
        SELECT TOP (@count) 
          Id, QuestionText, OptionA, OptionB, OptionC, OptionD, 
          CorrectAnswer, IsCritical, Category
        FROM [dbo].[Questions] 
        WHERE Category = @category
        ORDER BY 
          CASE WHEN IsCritical = 1 THEN 0 ELSE 1 END, -- Ưu tiên câu điểm liệt trước
          NEWID() -- Sau đó random
      `;
    } else {
      // Không yêu cầu câu điểm liệt, chỉ random theo category
      query += ` ORDER BY NEWID()`;
    }
    
    console.log('SQL Query:', query);
    
    let result;
    if (examType === 'official' && minCriticalQuestions > 0) {
      // Thi thật: Sử dụng query phức tạp với CTE
      result = await pool.request()
        .input('count', sql.Int, parseInt(questionCount))
        .input('minCriticalQuestions', sql.Int, parseInt(minCriticalQuestions))
        .input('category', sql.VarChar, category)
        .query(query);
    } else {
      // Thi thử: Sử dụng query đơn giản
      result = await pool.request()
        .input('count', sql.Int, parseInt(questionCount))
        .input('category', sql.VarChar, category)
        .query(query);
    }

    console.log('Query result count:', result.recordset.length);

    if (result.recordset.length === 0) {
      // Kiểm tra xem có câu hỏi nào trong category này không
      const checkCategory = await pool.request()
        .input('category', sql.VarChar, category)
        .query(`SELECT COUNT(*) as count FROM [dbo].[Questions] WHERE Category = @category`);
      
      const categoryCount = checkCategory.recordset[0].count;
      
      if (categoryCount === 0) {
        return res.status(404).json({ 
          error: `Không tìm thấy câu hỏi nào trong category '${category}'`,
          debug: {
            requestedCount: questionCount,
            requestedCategory: category,
            includeCritical: includeCritical,
            minCriticalQuestions: minCriticalQuestions,
            availableCategories: await getAvailableCategories(pool),
            sqlQuery: query
          }
        });
      } else {
        return res.status(404).json({ 
          error: `Không tìm thấy câu hỏi phù hợp với điều kiện hiện tại`,
          debug: {
            requestedCount: questionCount,
            requestedCategory: category,
            includeCritical: includeCritical,
            minCriticalQuestions: minCriticalQuestions,
            categoryCount: categoryCount,
            sqlQuery: query
          }
        });
      }
    }

    // Kiểm tra số câu điểm liệt cho thi thật
    if (examType === 'official' && minCriticalQuestions > 0) {
      const criticalCount = result.recordset.filter(q => q.IsCritical === 1).length;
      if (criticalCount < minCriticalQuestions) {
        console.log(`Warning: Chỉ có ${criticalCount} câu điểm liệt, yêu cầu ít nhất ${minCriticalQuestions}`);
      }
    }

    // Tạo đề thi với câu hỏi và đáp án được xáo trộn
    const examQuestions = result.recordset.map(question => {
      const shuffledQuestion = { ...question };
      
      if (shuffleAnswers) {
        // Tạo mảng đáp án và xáo trộn
        const options = [
          { key: 'A', value: question.OptionA },
          { key: 'B', value: question.OptionB },
          { key: 'C', value: question.OptionC },
          { key: 'D', value: question.OptionD }
        ].filter(opt => opt.value && opt.value.trim() !== ''); // Lọc bỏ đáp án rỗng

        // Xáo trộn đáp án
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        // Cập nhật đáp án mới
        shuffledQuestion.OptionA = options[0].value;
        shuffledQuestion.OptionB = options[1].value;
        if (options[2]) shuffledQuestion.OptionC = options[2].value;
        if (options[3]) shuffledQuestion.OptionD = options[3].value;

        // Cập nhật đáp án đúng theo thứ tự mới
        const correctAnswer = question.CorrectAnswer;
        const correctOption = options.find(opt => opt.key === correctAnswer);
        if (correctOption) {
          // Tìm vị trí mới của đáp án đúng
          const newCorrectIndex = options.findIndex(opt => opt.value === correctOption.value);
          const newCorrectKey = ['A', 'B', 'C', 'D'][newCorrectIndex];
          shuffledQuestion.CorrectAnswer = newCorrectKey;
        }
      }

      return shuffledQuestion;
    });

    // Tạo thông tin đề thi
    const examInfo = {
      examId: `EXAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      examType,
      questionCount: examQuestions.length,
      category,
      timeLimit: timeLimit * 60, // Chuyển về giây
      totalQuestions: examQuestions.length,
      criticalQuestions: examQuestions.filter(q => q.IsCritical === 1).length || 0,
      minCriticalRequired: minCriticalQuestions || 0,
      createdAt: new Date().toISOString(),
      questions: examQuestions
    };

    res.json({
      success: true,
      exam: examInfo
    });

  } catch (err) {
    console.error('Create exam error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Tạo đề thi theo cấu hình mặc định
exports.createDefaultExam = async (req, res) => {
  try {
    const { examType = 'practice' } = req.query;
    
    console.log('Create default exam request:', { examType });
    
    // Cấu hình mặc định cho từng loại thi
    const examConfigs = {
      practice: {
        questionCount: 25,
        category: 'AnToanGiaoThong',
        timeLimit: 20,
        shuffleAnswers: true,
        includeCritical: true
      },
      official: {
        questionCount: 35, // Thi thật: 35 câu
        category: 'AnToanGiaoThong',
        timeLimit: 30, // Thi thật: 30 phút
        shuffleAnswers: true,
        includeCritical: true,
        minCriticalQuestions: 3 // Thi thật: ít nhất 3 câu điểm liệt
      }
    };

    const config = examConfigs[examType] || examConfigs.practice;
    
    console.log('Default config:', config);
    
    // Gọi function tạo đề thi với cấu hình mặc định
    const examRequest = {
      body: config
    };
    
    return await exports.createExam(examRequest, res);

  } catch (err) {
    console.error('Create default exam error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy thông tin đề thi theo ID
exports.getExamById = async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Trong thực tế, bạn có thể lưu đề thi vào database
    // Hiện tại trả về thông báo
    res.json({
      success: true,
      message: 'Đề thi đã được tạo thành công',
      examId
    });

  } catch (err) {
    console.error('Get exam by ID error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function để lấy các category có sẵn
async function getAvailableCategories(pool) {
  try {
    const result = await pool.request().query(`
      SELECT DISTINCT Category, COUNT(*) as count 
      FROM [dbo].[Questions] 
      GROUP BY Category 
      ORDER BY Category
    `);
    return result.recordset;
  } catch (err) {
    console.error('Error getting available categories:', err);
    return [];
  }
}