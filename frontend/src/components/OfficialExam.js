import React, { useEffect, useState, useRef } from 'react';
import DarkVeil from '../components/DarkVeil';
import TextType from '../components/TextType';
import '../styles/PracticeExam.css';

const OfficialExam = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHomePopup, setShowHomePopup] = useState(false);
  const [showAntiCheatPopup, setShowAntiCheatPopup] = useState(false);
  const [violationsCount, setViolationsCount] = useState(0);
  const [disqualified, setDisqualified] = useState(false);
  const [isWaitingForSecondViolation, setIsWaitingForSecondViolation] = useState(false);
  
  // Thêm state cho việc sửa đáp án
  const [answerChanges, setAnswerChanges] = useState({}); // Lưu số lần sửa cho từng câu hỏi
  const [showChangeNotification, setShowChangeNotification] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const [changeTimeout, setChangeTimeout] = useState(null);
  

  
  // Sử dụng useRef để lưu trạng thái trang (không bị reset khi re-render)
  const isPageHiddenRef = useRef(false);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/questions');
        const data = await res.json();
        setQuestions(data);
      } catch (e) {
        // Error loading questions
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, questions.length]);



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
    
    // Phạt ngay khi rời trang
    if (violationsCount === 0) {
      setViolationsCount(1);
      setShowAntiCheatPopup(true);
      setIsWaitingForSecondViolation(true);
    } else {
      setDisqualified(true);
      setShowAntiCheatPopup(false);
      setIsSubmitted(true);
      setScore(0);
      setShowResult(true);
      setIsWaitingForSecondViolation(false);
    }
  };

  const handleAntiCheatPopupClose = () => {
    // Reset isPageHiddenRef để có thể phát hiện lần vi phạm thứ 2
    isPageHiddenRef.current = false;
    setShowAntiCheatPopup(false);
  };

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !isPageHiddenRef.current) {
        // Chỉ xử lý khi thực sự rời trang lần đầu
        isPageHiddenRef.current = true;
        registerViolation();
      } else if (!document.hidden) {
        // Reset khi quay lại trang
        isPageHiddenRef.current = false;
      }
    };
    
    const onBlur = () => {
      // Chỉ xử lý blur khi:
      // 1. Trang không bị ẩn (tránh duplicate với visibilitychange)
      // 2. isPageHiddenRef.current = false (chưa được đánh dấu là ẩn)
      // 3. Chưa bị hủy tư cách thi
      // 4. Chưa có popup cảnh báo đang hiển thị
      if (!document.hidden && !isPageHiddenRef.current && !disqualified && !showAntiCheatPopup) {
        isPageHiddenRef.current = true;
        registerViolation();
      }
    };
    
    const onFocus = () => {
      // Chỉ reset isPageHiddenRef khi chưa bị hủy tư cách thi và không có popup cảnh báo
      // Điều này đảm bảo rằng sau khi người dùng quay lại trang (và popup không hiển thị),
      // isPageHiddenRef được đặt lại để phát hiện lần rời trang tiếp theo.
      if (!disqualified && !showAntiCheatPopup) {
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    const currentAnswer = answers[questionId];
    const currentChanges = answerChanges[questionId] || 0;
    
    // Nếu chọn đáp án mới
    if (currentAnswer !== answer) {
      // Nếu đây là lần chọn đầu tiên, không tính là sửa
      if (currentAnswer === undefined) {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
        return;
      }
      
      // Từ lần thứ 2 trở đi mới tính là sửa đáp án
      if (currentChanges >= 3) {
        showChangeMessage('Bạn đã hết lượt sửa đáp án cho câu hỏi này!');
        return;
      }
      
      // Cập nhật đáp án
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
      
      // Tăng số lần sửa
      const newChanges = currentChanges + 1;
      setAnswerChanges(prev => ({ ...prev, [questionId]: newChanges }));
      
      // Hiển thị thông báo
      const remainingChanges = 3 - newChanges;
      if (remainingChanges > 0) {
        showChangeMessage(`Bạn còn ${remainingChanges} lần thay đổi đáp án cho câu hỏi này`);
      } else {
        showChangeMessage('Bạn đã hết lượt thay đổi đáp án cho câu hỏi này!');
      }
    }
  };

  const handleHeaderClick = () => {
    setShowHomePopup(true);
  };

  const handleConfirmHome = () => {
    setShowHomePopup(false);
    window.location.href = '/';
  };

  const handleCancelHome = () => {
    setShowHomePopup(false);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    if (questions && questions.length > 0) {
      questions.forEach(q => {
        if (answers[q.Id] === q.CorrectAnswer) correctCount++;
      });
    }
    const finalScore = Math.round((correctCount / (questions.length || 1)) * 100);
    setScore(finalScore);
    setShowResult(true);
  };

  if (loading) {
    return (
      <div className="practice-exam-container">
        <div className="practice-exam-background">
          <DarkVeil speed={0.5} hueShift={0} noiseIntensity={0} scanlineIntensity={0} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
        </div>
        <div className="loading-container">
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang tải câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const correctAnswers = questions && questions.length > 0 ? questions.filter(q => answers[q.Id] === q.CorrectAnswer).length : 0;
    const isPassed = !disqualified && score >= 80;
    return (
      <div className="practice-exam-container">
        <div className="practice-exam-background">
          <DarkVeil speed={0.5} hueShift={0} noiseIntensity={0} scanlineIntensity={0} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
        </div>
        <div className="result-container">
          <div className="result-card">
            <div className={`result-icon ${isPassed ? 'passed' : 'failed'}`}>{isPassed ? '✅' : '❌'}</div>
            {disqualified ? (
              <>
                <div className="result-score">Bạn đã bị hủy tư cách thi</div>
                <p className="result-description">Lý do: Rời khỏi trang làm bài 2 lần</p>
              </>
            ) : (
              <>
                <div className="result-score">{score}/100 điểm</div>
                <p className="result-description">Bạn trả lời đúng {correctAnswers}/{questions.length} câu</p>
              </>
            )}
            <div className="result-buttons">
              <button onClick={() => window.location.reload()} className="result-button primary">Thi lại</button>
              <button onClick={() => window.location.href = '/'} className="result-button secondary">Về trang chủ</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="practice-exam-container">
        <div className="practice-exam-background">
          <DarkVeil speed={0.5} hueShift={0} noiseIntensity={0} scanlineIntensity={0} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
        </div>
        <div className="loading-container">
          <p style={{ color: '#ef4444', fontSize: '18px' }}>Không thể tải câu hỏi. Vui lòng thử lại!</p>
        </div>
      </div>
    );
  }

  const currentQ = questions && questions.length > 0 ? questions[currentQuestion] : null;

  return (
    <div className="practice-exam-container">
      <div className="practice-exam-background">
        <DarkVeil speed={0.5} hueShift={0} noiseIntensity={0} scanlineIntensity={0} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
      </div>

      <div className="practice-exam-header">
        <div className="header-content">
          <div className="header-brand" onClick={handleHeaderClick} style={{ cursor: 'pointer' }}>
            <span className="header-logo">🚦</span>
            <span className="header-title">Thi Thật GPLX</span>
          </div>
          <div className="header-actions">
            <button className="feedback-button">Góp ý</button>
          </div>
        </div>
      </div>

      {showHomePopup && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <div className="home-popup-content">
              <h3>Xác nhận</h3>
              <p>Bạn có chắc chắn muốn về trang chủ? Tất cả tiến độ làm bài sẽ bị mất.</p>
              <div className="home-popup-buttons">
                <button onClick={handleConfirmHome} className="home-popup-btn confirm">Có, về trang chủ</button>
                <button onClick={handleCancelHome} className="home-popup-btn cancel">Không, tiếp tục làm bài</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAntiCheatPopup && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <div className="home-popup-content">
              <h3>Thông báo</h3>
              <p>Phát hiện bạn rời khỏi trang làm bài. Đây là cảnh báo lần 1. Nếu tiếp tục, bạn sẽ bị hủy tư cách thi.</p>
              <div className="home-popup-buttons">
                <button onClick={handleAntiCheatPopupClose} className="home-popup-btn confirm">Tôi hiểu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChangeNotification && (
        <div className={`change-notification ${changeMessage.includes('hết lượt') ? 'warning' : ''}`}>
          {changeMessage}
        </div>
      )}

      <div className="main-content">
        <div className="exam-header">
          <div className="exam-header-content">
            <div>
              <TextType
                key={`exam-title-${currentQuestion}`}
                text={[`Đề thi thật - ${questions ? questions.length : 0} câu hỏi`, `Bạn đang ở câu hỏi thứ ${currentQuestion + 1}`]}
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
              <span className="question-counter">Câu {currentQuestion + 1}/{questions ? questions.length : 0}</span>
              <div className="timer"><span>⏰</span><span>{formatTime(timeLeft)}</span></div>
            </div>
          </div>
        </div>

        <div className="exam-grid">
          <div className="question-nav">
            <h3 className="question-nav-title">Danh sách câu hỏi</h3>
            <div className="question-grid">
              {questions && questions.length > 0 && questions.map((_, index) => {
                const questionId = questions[index].Id;
                const answered = !!answers[questionId];
                const changes = answerChanges[questionId] || 0;
                const status = index === currentQuestion ? 'current' : (answered ? 'correct' : 'unanswered');
                return (
                  <button key={index} onClick={() => setCurrentQuestion(index)} className={`question-button ${status}`}>
                    <span>{index + 1}</span>
                    {changes > 0 && (
                      <span className={`change-count ${changes >= 3 ? 'warning' : ''}`} title={`Đã sửa ${changes}/3 lần`}>
                        {changes}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="question-legend">
              <div className="legend-item"><div className="legend-color current"></div><span className="legend-text">Hiện tại</span></div>
              <div className="legend-item"><div className="legend-color correct"></div><span className="legend-text">Đã chọn</span></div>
              <div className="legend-item"><div className="legend-color unanswered"></div><span className="legend-text">Chưa làm</span></div>
            </div>
            <div className="change-info">
              <p>💡 Bạn có thể sửa đáp án tối đa 3 lần cho mỗi câu hỏi</p>
            </div>
          </div>

          <div className="question-content">
            <div className="question-header">
              <h3 className="question-title">Câu {currentQuestion + 1}:</h3>
              <p className="question-text">{currentQ ? currentQ.QuestionText : 'Đang tải câu hỏi...'}</p>

              <div className="answer-options">
                {currentQ && ['A', 'B', 'C', 'D'].map(option => {
                  const optionText = currentQ[`Option${option}`];
                  if (!optionText) return null;
                  const isSelected = answers[currentQ.Id] === option;
                  const changes = answerChanges[currentQ.Id] || 0;
                  const isDisabled = changes >= 3;
                  
                  return (
                    <label key={option} className={`answer-option${isSelected ? ' selected' : ''}`}>
                      <input
                        type="radio"
                        name={`question-${currentQ.Id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(currentQ.Id, option)}
                        className="answer-radio"
                        disabled={isDisabled}
                      />
                      <div className="answer-text">
                        <span className="answer-label">{option}.</span>
                        <span className="answer-content">{optionText}</span>
                        {isSelected && (
                          <span className="answer-status correct">✓ Đã chọn</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {isSubmitted && currentQ && (
                <div className="explanation">
                  <div className="explanation-section">
                    <div className="explanation-title correct">Đáp án đúng:</div>
                    <div className="explanation-content correct">
                      {currentQ.CorrectAnswer}. {currentQ[`Option${currentQ.CorrectAnswer}`]}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="navigation-buttons">
              <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} className="nav-button">← Trước</button>
              <div className="nav-button-group">
                <button onClick={() => setCurrentQuestion(Math.min((questions ? questions.length : 0) - 1, currentQuestion + 1))} disabled={currentQuestion === (questions ? questions.length : 0) - 1} className="nav-button next">Sau →</button>
                <button onClick={handleSubmit} disabled={isSubmitted} className="nav-button submit">Nộp bài</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialExam;
