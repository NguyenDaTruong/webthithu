import React, { useEffect, useState, useRef } from 'react';
import DarkVeil from '../components/DarkVeil';
import TextType from '../components/TextType';
import '../styles/OfficialExam.css';
import { API_BASE, getToken, getUser } from '../utils/auth';

const OfficialExam = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 phút
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHomePopup, setShowHomePopup] = useState(false);
  const [showAntiCheatPopup, setShowAntiCheatPopup] = useState(false);
  const [violationsCount, setViolationsCount] = useState(0);
  const [disqualified, setDisqualified] = useState(false);
  const [isWaitingForSecondViolation, setIsWaitingForSecondViolation] = useState(false);
  const [examConfig, setExamConfig] = useState(null);
  
  // Thêm state cho việc sửa đáp án
  const [answerChanges, setAnswerChanges] = useState({});
  const [showChangeNotification, setShowChangeNotification] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const [changeTimeout, setChangeTimeout] = useState(null);
  
  // Trạng thái chứng chỉ
  const [certificateNote, setCertificateNote] = useState('');
  const [certificateApiError, setCertificateApiError] = useState('');
  const isAdmin = (() => { try { const u = getUser(); return u && (u.id === 1 || u.role === 'admin'); } catch { return false; } })();

  // Sử dụng useRef để lưu trạng thái trang (không bị reset khi re-render)
  const isPageHiddenRef = useRef(false);

  // Tự động tạo đề thi mặc định khi component mount (thi thật)
  useEffect(() => {
    createDefaultOfficialExam();
  }, []);

  // Tạo đề thi mặc định cho thi thật
  const createDefaultOfficialExam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/questions/create-default-exam?examType=official`);
      const data = await response.json();

      if (response.ok && data.success && data.exam) {
        handleExamCreated(data.exam);
      } else {
        console.error('Không thể tạo đề thi mặc định:', data.error);
        // Fallback: tạo đề thi với cấu hình cơ bản
        const fallbackExam = {
          questions: [],
          timeLimit: 1800, // 30 phút
          examType: 'official',
          questionCount: 35,
          category: 'AnToanGiaoThong'
        };
        handleExamCreated(fallbackExam);
      }
    } catch (err) {
      console.error('Lỗi tạo đề thi mặc định:', err);
      // Fallback: tạo đề thi với cấu hình cơ bản
      const fallbackExam = {
        questions: [],
        timeLimit: 1800, // 30 phút
        examType: 'official',
        questionCount: 35,
        category: 'AnToanGiaoThong'
      };
      handleExamCreated(fallbackExam);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi đề thi được tạo
  const handleExamCreated = (exam) => {
    setQuestions(exam.questions || []);
    setTimeLeft(exam.timeLimit || 1800); // 30 phút mặc định cho thi thật
    setCurrentQuestion(0);
    setAnswers({});
    setIsSubmitted(false);
    setShowResult(false);
    setScore(0);
    setAnswerChanges({});
    setExamConfig(exam);
    setDisqualified(false);
    setViolationsCount(0);
    // Reset anti-cheat state
    isPageHiddenRef.current = false;
  };

  // Reset để tạo đề thi mới
  const handleCreateNewExam = () => {
    createDefaultOfficialExam();
  };
  
  useEffect(() => {
    // Vào trang thi thật, đảm bảo cuộn lên đầu trang để không bị header dính che
    try { window.scrollTo(0, 0); } catch {}
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, questions.length]);

  // ANTI-CHEAT: Phát hiện khi người dùng rời trang
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !isPageHiddenRef.current && !disqualified && !isSubmitted) {
        // Chỉ xử lý khi thực sự rời trang lần đầu
        isPageHiddenRef.current = true;
        registerViolation();
      } else if (!document.hidden) {
        // Reset khi quay lại trang
        isPageHiddenRef.current = false;
      }
    };
    
    const onBlur = () => {
      if (!document.hidden && !isPageHiddenRef.current && !disqualified && !isSubmitted && !showAntiCheatPopup) {
        isPageHiddenRef.current = true;
        registerViolation();
      }
    };
    
    const onFocus = () => {
      if (!disqualified && !isSubmitted && !showAntiCheatPopup) {
        isPageHiddenRef.current = false;
      }
    };
    
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      if (changeTimeout) {
        clearTimeout(changeTimeout);
      }
    };
  }, [violationsCount, disqualified, isSubmitted, showAntiCheatPopup]);

  // Hiển thị thông báo sửa đáp án
  const showChangeMessage = (message) => {
    setChangeMessage(message);
    setShowChangeNotification(true);
    
    // Tự động ẩn sau 3 giây
    if (changeTimeout) {
      clearTimeout(changeTimeout);
    }
    const timeout = setTimeout(() => {
      setShowChangeNotification(false);
    }, 3000);
    setChangeTimeout(timeout);
  };

  const registerViolation = () => {
    if (disqualified || isSubmitted) {
      return;
    }
    
    console.log('Registering violation. Current count:', violationsCount);
    
    // Phạt ngay khi rời trang
    if (violationsCount === 0) {
      console.log('First violation - Setting count to 1');
      setViolationsCount(1);
      setShowAntiCheatPopup(true);
      setIsWaitingForSecondViolation(true);
    } else {
      console.log('Second violation - Disqualifying');
      setDisqualified(true);
      setShowAntiCheatPopup(false);
      setIsSubmitted(true);
      setScore(0);
      setShowResult(true);
      setIsWaitingForSecondViolation(false);
    }
  };

  const handleAntiCheatPopupClose = () => {
    console.log('Anti-cheat popup closed. Resetting isPageHiddenRef');
    // Reset isPageHiddenRef để có thể phát hiện lần vi phạm thứ 2
    isPageHiddenRef.current = false;
    setShowAntiCheatPopup(false);
    setIsWaitingForSecondViolation(false);
  };

  // Xử lý khi người dùng thay đổi đáp án (THI THẬT: giới hạn 3 lần)
  const handleAnswerChange = (questionId, newAnswer) => {
    if (isSubmitted || disqualified) return;

    const currentAnswer = answers[questionId];
    const currentChanges = answerChanges[questionId] || 0;

    // Kiểm tra xem có phải là lần thay đổi đầu tiên không
    if (currentAnswer !== undefined && currentAnswer !== newAnswer) {
      if (currentChanges >= 3) {
        showChangeMessage('Bạn đã hết lượt thay đổi đáp án cho câu hỏi này!');
        return;
      }
      
      // Cập nhật số lần thay đổi
      setAnswerChanges(prev => ({
        ...prev,
        [questionId]: currentChanges + 1
      }));
      
      showChangeMessage(`Bạn đã thay đổi đáp án lần thứ ${currentChanges + 1}/3`);
    }

    // Cập nhật đáp án
    setAnswers(prev => ({
      ...prev,
      [questionId]: newAnswer
    }));
  };

  const handleSubmit = () => {
    if (isSubmitted || disqualified) return;
    
    setIsSubmitted(true);
    
    // Tính điểm
    let correctAnswers = 0;
    let criticalCorrect = 0;
    let totalCritical = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.CorrectAnswer;
      
      if (userAnswer === correctAnswer) {
        correctAnswers++;
        if (question.IsCritical === 1) {
          criticalCorrect++;
        }
      }
      
      if (question.IsCritical === 1) {
        totalCritical++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    
    // Kiểm tra điều kiện đỗ
    const isPassed = finalScore >= 80 && criticalCorrect === totalCritical;
    
    // Nếu đỗ, gửi kết quả lên server để lưu chứng chỉ
    if (isPassed) {
      saveCertificateResult(finalScore, correctAnswers, questions.length, criticalCorrect, totalCritical);
    }
    
    setShowResult(true);
  };

  const saveCertificateResult = async (finalScore, correctAnswers, totalQuestions, criticalCorrect, totalCritical) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('Không có token để lưu kết quả');
        return;
      }

      const response = await fetch(`${API_BASE}/api/certificates/save-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: finalScore,
          correctAnswers,
          totalQuestions,
          criticalCorrect,
          totalCritical,
          examType: 'official',
          examDate: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setCertificateNote(data.message || 'Kết quả đã được lưu thành công!');
      } else {
        setCertificateApiError(data.error || 'Không thể lưu kết quả');
      }
    } catch (err) {
      console.error('Lỗi khi lưu kết quả:', err);
      setCertificateApiError('Lỗi kết nối khi lưu kết quả');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    if (!questions || !questions[index]) return 'unanswered';
    
    // THI THẬT: Chỉ hiển thị trạng thái đã làm/chưa làm, không hiển thị đúng/sai
    if (answers[index]) {
      return 'answered';
    }
    return 'unanswered';
  };

  if (loading) {
    return (
      <div className="official-exam-container">
        <div className="official-exam-background">
          <DarkVeil
            speed={0.5}
            hueShift={0}
            noiseIntensity={0}
            scanlineIntensity={0}
            scanlineFrequency={0}
            warpAmount={0}
            resolutionScale={1}
          />
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tạo đề thi...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const correctAnswers = Object.keys(answers).filter(key => 
      answers[key] === questions[parseInt(key)]?.CorrectAnswer
    ).length;
    
    // Nếu bị loại thì hiển thị thông báo bị hủy tư cách
    if (disqualified) {
      return (
        <div className="official-exam-container">
          <div className="official-exam-background">
            <DarkVeil
              speed={0.5}
              hueShift={0}
              noiseIntensity={0}
              scanlineIntensity={0}
              scanlineFrequency={0}
              warpAmount={0}
              resolutionScale={1}
            />
          </div>
          
          <div className="result-container">
            <div className="result-card">
              <div className="result-icon failed">
                ❌
              </div>
              <h2 className="result-title">
                Bạn đã bị hủy tư cách thi!
              </h2>
              
              <div className="result-score">Bị loại khỏi kỳ thi</div>
              <p className="result-description">Lý do: Rời khỏi trang làm bài 2 lần</p>
              
              <div className="result-buttons">
                <button onClick={() => window.location.reload()} className="result-button primary">Thi lại</button>
                <button onClick={() => { window.location.href = '/'; }} className="result-button secondary">Về trang chủ</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Nếu không bị loại thì hiển thị kết quả bình thường
    const isPassed = score >= 80;
    
    return (
      <div className="official-exam-container">
        <div className="official-exam-background">
          <DarkVeil
            speed={0.5}
            hueShift={0}
            noiseIntensity={0}
            scanlineIntensity={0}
            scanlineFrequency={0}
            warpAmount={0}
            resolutionScale={1}
          />
        </div>
        
        <div className="result-container">
          <div className="result-card">
            <div className={`result-icon ${isPassed ? 'passed' : 'failed'}`}>
              {isPassed ? '🎉' : '😔'}
            </div>
            <h2 className="result-title">
              {isPassed ? 'Chúc mừng! Bạn đã đỗ!' : 'Tiếc quá! Bạn chưa đỗ'}
            </h2>
            
            <div className="result-score">{score}/100 điểm</div>
            <p className="result-description">Bạn trả lời đúng {correctAnswers}/{questions.length} câu</p>
            
            {/* Hiển thị thông tin đề thi */}
            {examConfig && (
              <div className="exam-info-display">
                <p><strong>📊 Thông tin đề thi:</strong></p>
                <p>• Số câu hỏi: {examConfig.totalQuestions}</p>
                <p>• Câu điểm liệt: {examConfig.criticalQuestions}</p>
                <p>• Chứng chỉ: {examConfig.category}</p>
                <p>• Thời gian: {Math.floor(examConfig.timeLimit / 60)} phút</p>
                {examConfig.minCriticalRequired > 0 && (
                  <p>• Yêu cầu tối thiểu: {examConfig.minCriticalRequired} câu điểm liệt</p>
                )}
              </div>
            )}
            
            {/* Hiển thị thông tin câu điểm liệt */}
            {questions.some(q => q.IsCritical === 1) && (
              <div className="critical-questions-info">
                <p><strong>🚨 Câu điểm liệt:</strong></p>
                <p>• Tổng số: {questions.filter(q => q.IsCritical === 1).length} câu</p>
                <p>• Trả lời đúng: {questions.filter((q, i) => q.IsCritical === 1 && answers[i] === q.CorrectAnswer).length} câu</p>
                <p>• Yêu cầu: Phải trả lời đúng TẤT CẢ câu điểm liệt để đỗ</p>
              </div>
            )}
            
            {/* Hiển thị ghi chú chứng chỉ */}
            {certificateNote && (
              <div className="certificate-note success">
                {certificateNote}
              </div>
            )}
            
            {certificateApiError && (
              <div className="certificate-note error">
                {certificateApiError}
              </div>
            )}
            
            <div className="result-buttons">
              <button onClick={() => window.location.reload()} className="result-button primary">Thi lại</button>
              {isPassed && (
                <button onClick={() => { window.location.href = '/certificate'; }} className="result-button secondary">Đến trang chứng chỉ</button>
              )}
              <button onClick={() => { window.location.href = '/'; }} className="result-button secondary">Về trang chủ</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (disqualified) {
    return (
      <div className="official-exam-container">
        <div className="official-exam-background">
          <DarkVeil
            speed={0.5}
            hueShift={0}
            noiseIntensity={0}
            scanlineIntensity={0}
            scanlineFrequency={0}
            warpAmount={0}
            resolutionScale={1}
          />
        </div>
        
        <div className="main-content">
          <div className="disqualified-container">
            <h2 className="disqualified-title">❌ Bạn đã bị loại!</h2>
            <p className="disqualified-description">
              Bạn đã vi phạm quy định thi nhiều lần và bị loại khỏi kỳ thi.
            </p>
            <div className="disqualified-buttons">
              <button onClick={() => window.location.reload()} className="disqualified-button">Thi lại</button>
              <button onClick={() => { window.location.href = '/'; }} className="disqualified-button secondary">Về trang chủ</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="official-exam-container">
      <div className="official-exam-background">
        <DarkVeil speed={0.5} hueShift={0} noiseIntensity={0} scanlineIntensity={0} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
      </div>

      {/* Bỏ header phụ, dùng SiteHeader hiển thị tiêu đề giữa */}

      {showHomePopup && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <div className="home-popup-content">
              <h3>⚠️ Cảnh báo</h3>
              <p>Bạn có chắc chắn muốn rời khỏi trang thi?</p>
              <div className="home-popup-buttons">
                <button onClick={() => setShowHomePopup(false)} className="home-popup-btn cancel">Ở lại</button>
                <button onClick={() => { window.location.href = '/'; }} className="home-popup-btn confirm">Rời khỏi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAntiCheatPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>🚨 Cảnh báo vi phạm!</h3>
            <p>
              {violationsCount === 1 
                ? 'Đây là lần vi phạm đầu tiên. Nếu vi phạm thêm 1 lần nữa, bạn sẽ bị loại khỏi kỳ thi!'
                : 'Bạn đã vi phạm quy định thi nhiều lần và bị loại khỏi kỳ thi!'
              }
            </p>
            <div className="popup-buttons">
              <button onClick={handleAntiCheatPopupClose} className="popup-button primary">
                {violationsCount === 1 ? 'Tôi hiểu rồi' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangeNotification && (
        <div className="change-notification">
          {changeMessage}
        </div>
      )}

      <div className="main-content">
        <div className="exam-header">
          <div className="exam-header-content">
            <div>
              <TextType
                text={[
                  'Thi thật - Chứng chỉ an toàn giao thông',
                  'Đề thi: 35 câu hỏi - Thời gian: 30 phút'
                ]}
                className="exam-title"
                typingSpeed={75}
                initialDelay={500}
                pauseDuration={1000}
                deletingSpeed={50}
                loop={true}
                showCursor={true}
                cursorCharacter="|"
              />
            </div>
            <div className="exam-info">
              <div className="question-counter">
                Câu hỏi: {currentQuestion + 1}/{questions.length}
              </div>
              <div className="timer">
                <span>⏱️</span>
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="exam-grid">
          {/* Question Navigation */}
          <div className="question-nav">
            <h3 className="question-nav-title">
              Danh sách câu hỏi
            </h3>

            <div className="question-grid">
              {questions && questions.length > 0 && questions.map((_, index) => {
                const status = index === currentQuestion ? 'current' : getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`question-button ${status}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="question-legend">
              <div className="legend-item">
                <div className="legend-color current"></div>
                <span className="legend-text">Hiện tại</span>
              </div>
              <div className="legend-item">
                <div className="legend-color answered"></div>
                <span className="legend-text">Đã làm</span>
              </div>
              <div className="legend-item">
                <div className="legend-color unanswered"></div>
                <span className="legend-text">Chưa làm</span>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="question-content">
            <div className="question-header">
              <h3 className="question-title">
                Câu {currentQuestion + 1}:
                {/* Icon câu điểm liệt */}
                {questions[currentQuestion] && questions[currentQuestion].IsCritical === 1 && (
                  <span className="critical-question-icon" title="Câu điểm liệt - Nếu sai sẽ không đạt bài thi">
                    🚨
                  </span>
                )}
              </h3>
               
              <p className="question-text">
                {questions[currentQuestion] ? questions[currentQuestion].QuestionText : 'Đang tải câu hỏi...'}
              </p>

              <div className="answer-options">
                {questions[currentQuestion] && ['A', 'B', 'C', 'D'].map(option => {
                  const optionText = questions[currentQuestion][`Option${option}`];
                  if (!optionText) return null;
                   
                  const isSelected = answers[currentQuestion] === option;
                  
                  // THI THẬT: Không hiển thị đáp án đúng/sai cho đến khi nộp bài
                  let optionClasses = 'answer-option';
                  if (isSelected) {
                    optionClasses += ' selected';
                  }
                   
                  return (
                    <label 
                      key={option}
                      className={optionClasses}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(currentQuestion, option)}
                        className="answer-radio"
                        disabled={isSubmitted}
                      />
                      <div className="answer-text">
                        <span className="answer-label">{option}.</span>
                        <span className="answer-content">{optionText}</span>
                        {/* THI THẬT: Hiển thị số lần sửa đáp án - CHỈ HIỂN THỊ KHI CÓ SỬA ĐÁP ÁN */}
                        {isSelected && answerChanges[currentQuestion] > 0 && (
                          <span className="change-count">
                            ({answerChanges[currentQuestion]}/3)
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="nav-button"
              >
                ← Trước
              </button>

              <div className="nav-button-group">
                <button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === questions.length - 1}
                  className="nav-button next"
                >
                  Sau →
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitted || Object.keys(answers).length < questions.length}
                  className="nav-button submit"
                >
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialExam;
