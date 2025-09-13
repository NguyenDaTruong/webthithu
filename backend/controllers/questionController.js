const { getPool } = require('../config/db');
const sql = require('mssql');

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
    const { count = 25, shuffleOptions = 'true' } = req.query;
    
    console.log('🔍 getRandomQuestions called with params:', { count, shuffleOptions });
    
    const pool = await getPool();
    console.log('✅ Database pool connected');
    
    const result = await pool.request()
      .input('count', sql.Int, parseInt(count))
      .query(`
        SELECT TOP (@count) Id, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, IsCritical, Category, Explanation
        FROM [dbo].[Questions] 
        ORDER BY NEWID()
      `);
    
    console.log('📊 Raw questions from DB:', result.recordset.length);
    console.log('📝 Sample question:', result.recordset[0] ? {
      Id: result.recordset[0].Id,
      QuestionText: result.recordset[0].QuestionText?.substring(0, 50) + '...',
      CorrectAnswer: result.recordset[0].CorrectAnswer
    } : 'No questions found');
    
    // Random thứ tự đáp án nếu được yêu cầu
    let questions = result.recordset;
    if (shuffleOptions === 'true') {
      console.log('🎲 Shuffling options...');
      questions = result.recordset.map(question => shuffleQuestionOptions(question));
      console.log('✅ Options shuffled');
    }
    
    console.log('📤 Sending response with', questions.length, 'questions');
    res.json(questions);
  } catch (err) {
    console.error('❌ getRandomQuestions error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function để random thứ tự đáp án A, B, C, D
function shuffleQuestionOptions(question) {
  const options = [
    { key: 'A', value: question.OptionA },
    { key: 'B', value: question.OptionB },
    { key: 'C', value: question.OptionC },
    { key: 'D', value: question.OptionD }
  ];
  
  // Shuffle array
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  // Tìm đáp án đúng trong thứ tự mới
  const correctIndex = options.findIndex(opt => opt.key === question.CorrectAnswer);
  const newCorrectAnswer = String.fromCharCode(65 + correctIndex); // A, B, C, D
  
  return {
    ...question,
    OptionA: options[0].value,
    OptionB: options[1].value,
    OptionC: options[2].value,
    OptionD: options[3].value,
    CorrectAnswer: newCorrectAnswer,
    OriginalCorrectAnswer: question.CorrectAnswer // Lưu đáp án gốc để debug
  };
}

// API mới cho thi thật - 20 câu hỏi với random đáp án
exports.getOfficialExamQuestions = async (req, res) => {
  try {
    const pool = await getPool();
    
    // Lấy 20 câu hỏi random từ tất cả category
    const result = await pool.request()
      .input('count', sql.Int, 20)
      .query(`
        SELECT TOP (@count) Id, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, IsCritical
        FROM [dbo].[Questions] 
        ORDER BY NEWID()
      `);
    
    // Random thứ tự đáp án cho từng câu hỏi
    const shuffledQuestions = result.recordset.map(question => shuffleQuestionOptions(question));
    
    res.json(shuffledQuestions);
  } catch (err) {
    console.error('Get official exam questions error:', err);
    res.status(500).json({ error: err.message });
  }
};