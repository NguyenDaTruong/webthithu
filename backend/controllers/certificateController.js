const { getPool } = require('../config/db');
const sql = require('mssql');

// Helper: get or create a draft certificate row for a user
async function getOrCreateDraftCertificate(pool, userId) {
  const existing = await pool.request()
    .input('userId', userId)
    .query(`SELECT TOP 1 * FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC`);

  if (existing.recordset && existing.recordset.length > 0) {
    return existing.recordset[0];
  }

  const inserted = await pool.request()
    .input('userId', userId)
    .query(`INSERT INTO dbo.Certificates(userId, isLocked, isPassed)
            OUTPUT INSERTED.*
            VALUES(@userId, 0, 0)`);
  return inserted.recordset[0];
}

// POST /api/certificate/eligibility
// body hỗ trợ 2 dạng (giữ tương thích cũ):
// - Cũ: { score: number (thang 10), criticalCorrect: boolean, resultId?: number }
// - Mới khuyến nghị: { correct: number, total: number, resultId?: number }
// Quy tắc đậu mới: sai ≤ 3 câu ⇒ đậu. Hệ thống vẫn lưu score (thang 10) để tương thích.
exports.evaluateEligibility = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { score, criticalCorrect, resultId, correct, total } = req.body || {};

    let computedScore10;
    let isPassed;

    if (typeof correct === 'number' && typeof total === 'number' && total > 0 && correct >= 0 && correct <= total) {
      const wrong = total - correct;
      isPassed = wrong <= 3; // Quy tắc mới
      computedScore10 = Math.round((correct / total) * 10);
    } else {
      // Fallback tương thích cũ
      if (typeof score !== 'number' || typeof criticalCorrect !== 'boolean') {
        return res.status(400).json({ message: 'Provide either (correct, total) or (score, criticalCorrect)' });
      }
      isPassed = score >= 8 && !!criticalCorrect;
      computedScore10 = score;
    }

    // Nếu đã có chứng chỉ và đã lock tên thì không ghi đè
    const latest = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT TOP 1 * FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC`);
    if (latest.recordset && latest.recordset[0] && latest.recordset[0].isLocked) {
      return res.json({ isPassed: latest.recordset[0].isPassed === true, certificate: latest.recordset[0], locked: true });
    }

    // Tạo Results record trước để có ResultId hợp lệ
    let actualResultId = resultId;
    if (!actualResultId || actualResultId === 0) {
      const insertResult = await pool.request()
        .input('userId', sql.Int, userId)
        .input('score', sql.Int, computedScore10)
        .input('passed', sql.Bit, isPassed ? 1 : 0)
        .query(`INSERT INTO dbo.Results (UserId, Score, Passed, AttemptDate)
                VALUES (@userId, @score, @passed, GETDATE());
                SELECT CAST(SCOPE_IDENTITY() AS INT) AS rid;`);
      
      actualResultId = insertResult.recordset && insertResult.recordset[0] && insertResult.recordset[0].rid;
      if (!actualResultId) {
        return res.status(500).json({ message: 'Cannot create Results record' });
      }
    }

    // Upsert Certificate với ResultId hợp lệ
    const dbReq = pool.request()
      .input('userId', sql.Int, userId)
      .input('isPassed', sql.Bit, isPassed ? 1 : 0)
      .input('score', sql.Int, computedScore10)
      .input('criticalCorrect', sql.Bit, 1)
      .input('correct', sql.Int, typeof correct === 'number' ? correct : null)
      .input('total', sql.Int, typeof total === 'number' ? total : null)
      .input('resultId', sql.Int, actualResultId);

    const upsertQuery = `
      IF EXISTS (SELECT 1 FROM dbo.Certificates WHERE userId = @userId)
      BEGIN
        UPDATE dbo.Certificates
          SET isPassed = @isPassed,
              score = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'score','ColumnId') IS NULL THEN score ELSE @score END,
              criticalCorrect = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'criticalCorrect','ColumnId') IS NULL THEN criticalCorrect ELSE @criticalCorrect END,
              CorrectAnswers = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'CorrectAnswers','ColumnId') IS NULL THEN CorrectAnswers ELSE @correct END,
              TotalQuestions = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'TotalQuestions','ColumnId') IS NULL THEN TotalQuestions ELSE @total END,
              ResultId = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'ResultId','ColumnId') IS NULL THEN ResultId ELSE @resultId END,
              UpdatedAt = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'UpdatedAt','ColumnId') IS NULL THEN GETDATE() ELSE GETDATE() END
        WHERE Id = (SELECT TOP 1 Id FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC);
      END
      ELSE
      BEGIN
        DECLARE @hasResultId BIT = CASE WHEN COL_LENGTH('dbo.Certificates','ResultId') IS NULL THEN 0 ELSE 1 END;
        DECLARE @hasCertPath BIT = CASE WHEN COL_LENGTH('dbo.Certificates','CertPath') IS NULL THEN 0 ELSE 1 END;

        IF @hasResultId = 1 AND @hasCertPath = 1
          INSERT INTO dbo.Certificates(userId, isPassed, ResultId, CertPath, score, criticalCorrect, CorrectAnswers, TotalQuestions)
          VALUES(@userId, @isPassed, @resultId, N'', @score, @criticalCorrect, @correct, @total);
        ELSE IF @hasResultId = 1 AND @hasCertPath = 0
          INSERT INTO dbo.Certificates(userId, isPassed, ResultId, score, criticalCorrect, CorrectAnswers, TotalQuestions)
          VALUES(@userId, @isPassed, @resultId, @score, @criticalCorrect, @correct, @total);
        ELSE IF @hasCertPath = 1
          INSERT INTO dbo.Certificates(userId, isPassed, CertPath, score, criticalCorrect, CorrectAnswers, TotalQuestions)
          VALUES(@userId, @isPassed, N'', @score, @criticalCorrect, @correct, @total);
        ELSE
          INSERT INTO dbo.Certificates(userId, isPassed, score, criticalCorrect, CorrectAnswers, TotalQuestions)
          VALUES(@userId, @isPassed, @score, @criticalCorrect, @correct, @total);
      END
      SELECT TOP 1 * FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC;`;

    const updated = await dbReq.query(upsertQuery);
    let certUpdated = updated.recordset && updated.recordset[0];

    return res.json({ isPassed, certificate: certUpdated });
  } catch (err) {
    console.error('evaluateEligibility error', err);
    return res.status(500).json({ message: String(err && err.message ? err.message : err) });
  }
};

// GET /api/certificate/status
exports.getStatus = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const result = await pool.request()
      .input('userId', userId)
      .query(`SELECT TOP 1 * FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC`);

    if (!result.recordset || result.recordset.length === 0) {
      return res.json({ hasCertificate: false });
    }
    const cert = result.recordset[0];
    return res.json({ hasCertificate: true, certificate: cert });
  } catch (err) {
    console.error('getStatus error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/certificate/issue-name
// body: { certificateName: string }
exports.issueName = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { certificateName } = req.body || {};
    if (!certificateName || !certificateName.trim()) {
      return res.status(400).json({ message: 'certificateName is required' });
    }

    // Ensure the latest certificate is passed and not locked
    const latest = await pool.request()
      .input('userId', userId)
      .query(`SELECT TOP 1 * FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC`);

    if (!latest.recordset || latest.recordset.length === 0) {
      return res.status(400).json({ message: 'No certificate context found' });
    }
    const cert = latest.recordset[0];
    if (!cert.isPassed) return res.status(400).json({ message: 'Not eligible to issue certificate' });
    if (cert.isLocked) return res.status(400).json({ message: 'Certificate name is already locked' });

    const updated = await pool.request()
      .input('userId', userId)
      .input('certificateName', certificateName.trim())
      .query(`UPDATE dbo.Certificates
              SET certificateName = @certificateName,
                  isLocked = 1,
                  issuedAt = GETUTCDATE()
              WHERE Id = (SELECT TOP 1 Id FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC);
              SELECT TOP 1 * FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC;`);

    return res.json({ success: true, certificate: updated.recordset && updated.recordset[0] });
  } catch (err) {
    console.error('issueName error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/certificate/:id
exports.getCertificateById = async (req, res) => {
  try {
    const pool = await getPool();
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' });

    const result = await pool.request()
      .input('id', id)
      .query(`SELECT * FROM dbo.Certificates WHERE Id = @id`);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('getCertificateById error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DEV ONLY: reset certificates for current user (admin/test purposes)
exports.devReset = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user && req.user.userId;
    const role = req.user && req.user.role;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    // Only allow admin role or userId=1 for safety
    if (!(role === 'admin' || userId === 1)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await pool.request().input('userId', sql.Int, userId).query(`DELETE FROM dbo.Certificates WHERE userId = @userId`);
    return res.json({ success: true });
  } catch (e) {
    console.error('devReset error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DEV ONLY: mark current user as passed and create a dummy Results row if needed
exports.devPass = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user && req.user.userId;
    const role = req.user && req.user.role;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!(role === 'admin' || userId === 1)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 1) Create a minimal Results row for this user to satisfy FK(ResultId)
    const insertResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`INSERT INTO dbo.Results (UserId, Score, Passed, AttemptDate)
              VALUES (@userId, 10, 1, GETDATE());
              SELECT CAST(SCOPE_IDENTITY() AS INT) AS rid;`);
    const rid = insertResult.recordset && insertResult.recordset[0] && insertResult.recordset[0].rid;
    if (!rid) return res.status(500).json({ message: 'Cannot create Results row' });

    // 2) Upsert Certificates with this rid
    const upsert = await pool.request()
      .input('userId', sql.Int, userId)
      .input('rid', sql.Int, rid)
      .query(`IF EXISTS (SELECT 1 FROM dbo.Certificates WHERE userId = @userId)
      BEGIN
        UPDATE dbo.Certificates
          SET isPassed = 1,
              score = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'score','ColumnId') IS NULL THEN score ELSE 10 END,
              criticalCorrect = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'criticalCorrect','ColumnId') IS NULL THEN criticalCorrect ELSE 1 END,
              ResultId = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'ResultId','ColumnId') IS NULL THEN ResultId ELSE @rid END,
              UpdatedAt = CASE WHEN COLUMNPROPERTY(OBJECT_ID('dbo.Certificates'),'UpdatedAt','ColumnId') IS NULL THEN GETDATE() ELSE GETDATE() END
        WHERE Id = (SELECT TOP 1 Id FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC);
      END
      ELSE
      BEGIN
        DECLARE @hasCertPath BIT = CASE WHEN COL_LENGTH('dbo.Certificates','CertPath') IS NULL THEN 0 ELSE 1 END;
        IF @hasCertPath = 1
          INSERT INTO dbo.Certificates(userId, isPassed, ResultId, score, criticalCorrect, CertPath)
          VALUES(@userId, 1, @rid, 10, 1, N'');
        ELSE
          INSERT INTO dbo.Certificates(userId, isPassed, ResultId, score, criticalCorrect)
          VALUES(@userId, 1, @rid, 10, 1);
      END
      SELECT TOP 1 * FROM dbo.Certificates WHERE userId = @userId ORDER BY Id DESC;`);

    return res.json({ success: true, certificate: upsert.recordset && upsert.recordset[0] });
  } catch (e) {
    console.error('devPass error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};
