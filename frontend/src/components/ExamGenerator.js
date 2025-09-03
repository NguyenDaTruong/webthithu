import React, { useState, useEffect } from 'react';
import '../styles/ExamGenerator.css';

const ExamGenerator = ({ onExamCreated, examType = 'practice' }) => {
  const [examConfig, setExamConfig] = useState({
    questionCount: 25,
    category: 'AnToanGiaoThong', // Chỉ có 1 category duy nhất
    timeLimit: 20,
    shuffleAnswers: true,
    includeCritical: true
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [tableData, setTableData] = useState(null);

  const questionCounts = [10, 15, 20, 25, 30, 40, 50];
  const timeLimits = [10, 15, 20, 25, 30, 45, 60];

  // Load available categories khi component mount
  useEffect(() => {
    loadAvailableCategories();
  }, []);

  const loadAvailableCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/questions/check-data');
      if (response.ok) {
        const data = await response.json();
        if (data.categories && data.categories.length > 0) {
          const categories = data.categories.map(cat => cat.Category);
          
          // Nếu category hiện tại không có trong danh sách, chọn category đầu tiên
          if (!categories.includes(examConfig.category)) {
            setExamConfig(prev => ({
              ...prev,
              category: categories[0]
            }));
          }
        }
      }
    } catch (err) {
      console.log('Không thể load categories từ database, sử dụng category mặc định');
    }
  };

  const handleConfigChange = (field, value) => {
    setExamConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Kiểm tra cấu trúc database
  const checkDatabaseStructure = async () => {
    try {
      setDebugInfo('Đang kiểm tra cấu trúc database...');
      const response = await fetch('http://localhost:5000/api/questions/check-structure');
      const data = await response.json();
      
      if (response.ok) {
        setDebugInfo(`Cấu trúc bảng Questions:\n${JSON.stringify(data.columns, null, 2)}`);
      } else {
        setDebugInfo(`Lỗi kiểm tra cấu trúc: ${data.error}`);
      }
    } catch (err) {
      setDebugInfo(`Lỗi kết nối: ${err.message}`);
    }
  };

  // Kiểm tra dữ liệu trong bảng
  const checkTableData = async () => {
    try {
      setDebugInfo('Đang kiểm tra dữ liệu trong bảng...');
      const response = await fetch('http://localhost:5000/api/questions/check-data');
      const data = await response.json();
      
      if (response.ok) {
        setTableData(data);
        setDebugInfo(`Dữ liệu bảng Questions:\nTổng số câu hỏi: ${data.totalQuestions}\nCategories: ${JSON.stringify(data.categories, null, 2)}\nMẫu câu hỏi: ${JSON.stringify(data.sampleQuestions, null, 2)}`);
      } else {
        setDebugInfo(`Lỗi kiểm tra dữ liệu: ${data.error}`);
      }
    } catch (err) {
      setDebugInfo(`Lỗi kết nối: ${err.message}`);
    }
  };

  const generateExam = async () => {
    setIsGenerating(true);
    setError('');
    setDebugInfo('');

    try {
      const response = await fetch('http://localhost:5000/api/questions/create-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...examConfig,
          examType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.debug) {
          setDebugInfo(`Lỗi chi tiết:\n${JSON.stringify(data.debug, null, 2)}`);
        }
        throw new Error(data.error || 'Không thể tạo đề thi');
      }

      if (data.success && data.exam) {
        onExamCreated(data.exam);
      } else {
        throw new Error('Dữ liệu đề thi không hợp lệ');
      }

    } catch (err) {
      setError(err.message);
      setDebugInfo(`Lỗi chi tiết: ${err.message}\n\nHãy kiểm tra console để xem thông tin lỗi đầy đủ.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDefaultExam = async () => {
    setIsGenerating(true);
    setError('');
    setDebugInfo('');

    try {
      const response = await fetch(`http://localhost:5000/api/questions/create-default-exam?examType=${examType}`);
      const data = await response.json();

      if (!response.ok) {
        if (data.debug) {
          setDebugInfo(`Lỗi chi tiết:\n${JSON.stringify(data.debug, null, 2)}`);
        }
        throw new Error(data.error || 'Không thể tạo đề thi mặc định');
      }

      if (data.success && data.exam) {
        onExamCreated(data.exam);
      } else {
        throw new Error('Dữ liệu đề thi không hợp lệ');
      }

    } catch (err) {
      setError(err.message);
      setDebugInfo(`Lỗi chi tiết: ${err.message}\n\nHãy kiểm tra console để xem thông tin lỗi đầy đủ.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Chỉ hiển thị ExamGenerator ở thi thử
  if (examType !== 'practice') {
    return null;
  }

  return (
    <div className="exam-generator">
      <div className="generator-header">
        <h3>🎯 Tạo đề thi thử</h3>
        <p>Tùy chỉnh cấu hình đề thi theo ý muốn</p>
      </div>

      <div className="generator-config">
        <div className="config-section">
          <h4>📊 Cấu hình cơ bản</h4>
          
          <div className="config-row">
            <div className="config-item">
              <label>Số lượng câu hỏi:</label>
              <select
                value={examConfig.questionCount}
                onChange={(e) => handleConfigChange('questionCount', parseInt(e.target.value))}
              >
                {questionCounts.map(count => (
                  <option key={count} value={count}>{count} câu</option>
                ))}
              </select>
            </div>

            <div className="config-item">
              <label>Chứng chỉ:</label>
              <select
                value={examConfig.category}
                onChange={(e) => handleConfigChange('category', e.target.value)}
                disabled // Chỉ có 1 category duy nhất
              >
                <option value="AnToanGiaoThong">An toàn giao thông</option>
              </select>
            </div>

            <div className="config-item">
              <label>Thời gian (phút):</label>
              <select
                value={examConfig.timeLimit}
                onChange={(e) => handleConfigChange('timeLimit', parseInt(e.target.value))}
              >
                {timeLimits.map(time => (
                  <option key={time} value={time}>{time} phút</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h4>⚙️ Tùy chọn nâng cao</h4>
          
          <div className="config-row">
            <div className="config-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={examConfig.shuffleAnswers}
                  onChange={(e) => handleConfigChange('shuffleAnswers', e.target.checked)}
                />
                🔀 Xáo trộn thứ tự đáp án
              </label>
              <small>Đáp án A, B, C, D sẽ được sắp xếp lại ngẫu nhiên</small>
            </div>

            <div className="config-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={examConfig.includeCritical}
                  onChange={(e) => handleConfigChange('includeCritical', e.target.checked)}
                />
                🚨 Bao gồm câu điểm liệt
              </label>
              <small>Đảm bảo đề thi có câu hỏi điểm liệt (nếu có)</small>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {debugInfo && (
          <div className="debug-info">
            <h4>🔍 Thông tin debug:</h4>
            <pre>{debugInfo}</pre>
          </div>
        )}

        {tableData && (
          <div className="table-data-info">
            <h4>📊 Thông tin dữ liệu:</h4>
            <div className="data-summary">
              <p><strong>Tổng số câu hỏi:</strong> {tableData.totalQuestions}</p>
              <p><strong>Categories có sẵn:</strong></p>
              <ul>
                {tableData.categories.map((cat, index) => (
                  <li key={index}>{cat.Category}: {cat.count} câu hỏi</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="generator-actions">
          <button
            onClick={generateExam}
            disabled={isGenerating}
            className="btn btn-primary"
          >
            {isGenerating ? '🔄 Đang tạo...' : '🎯 Tạo đề thi tùy chỉnh'}
          </button>

          <button
            onClick={generateDefaultExam}
            disabled={isGenerating}
            className="btn btn-secondary"
          >
            {isGenerating ? '🔄 Đang tạo...' : '⚡ Tạo đề thi mặc định'}
          </button>

          <div className="debug-buttons">
            <button
              onClick={checkDatabaseStructure}
              className="btn btn-outline"
            >
              🔍 Kiểm tra cấu trúc database
            </button>

            <button
              onClick={checkTableData}
              className="btn btn-outline"
            >
              📊 Kiểm tra dữ liệu
            </button>
          </div>
        </div>
      </div>

      <div className="generator-info">
        <h4>ℹ️ Thông tin về đề thi</h4>
        <ul>
          <li>✅ <strong>Random câu hỏi:</strong> Mỗi lần tạo đề thi sẽ có câu hỏi khác nhau</li>
          <li>✅ <strong>Xáo trộn đáp án:</strong> Thứ tự A, B, C, D được thay đổi ngẫu nhiên</li>
          <li>✅ <strong>Đáp án đúng:</strong> Hệ thống tự động cập nhật đáp án đúng theo thứ tự mới</li>
          <li>✅ <strong>Thời gian:</strong> Đồng hồ đếm ngược tự động</li>
          <li>✅ <strong>Kết quả:</strong> Hiển thị điểm số và giải thích chi tiết</li>
        </ul>
      </div>

      <div className="troubleshooting-info">
        <h4>🛠️ Khắc phục sự cố</h4>
        <p>Nếu gặp lỗi, hãy thử các bước sau:</p>
        <ol>
          <li>Kiểm tra backend server có đang chạy không</li>
          <li>Kiểm tra kết nối database</li>
          <li>Sử dụng nút "Kiểm tra cấu trúc database" để debug</li>
          <li>Sử dụng nút "Kiểm tra dữ liệu" để xem dữ liệu có sẵn không</li>
          <li>Chạy script SQL <code>fix_database_for_single_category.sql</code> để sửa database</li>
        </ol>
      </div>
    </div>
  );
};

export default ExamGenerator;
