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
    const { count = 25, category = 'A1' } = req.query;
    
    const pool = await getPool();
    const result = await pool.request()
      .input('count', sql.Int, parseInt(count))
      .input('category', sql.VarChar, category)
      .query(`
        SELECT TOP (@count) Id, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer
        FROM [dbo].[Questions] 
        WHERE Category = @category AND IsActive = 1
        ORDER BY NEWID()
      `);
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};