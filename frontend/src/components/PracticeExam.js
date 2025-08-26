import React, { useState, useEffect } from 'react';
import DarkVeil from '../components/DarkVeil';
import SplitText from '../components/SplitText';
import TextType from '../components/TextType';
import '../styles/PracticeExam.css';

const PracticeExam = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes for 10 questions
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState({}); // Hiển thị giải thích cho từng câu hỏi
  const [showHomePopup, setShowHomePopup] = useState(false); // Hiển thị popup xác nhận về homepage

  // Load questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Lấy tất cả câu hỏi từ database
        const response = await fetch('http://localhost:5000/api/questions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Loaded questions:', data ? data.length : 0);
        setQuestions(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && questions && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, questions]);

  // Debug state changes
  useEffect(() => {
    console.log('Answers state changed:', answers);
    console.log('ShowExplanation state changed:', showExplanation);
  }, [answers, showExplanation]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    console.log('handleAnswerSelect called:', { questionId, answer, currentAnswers: answers });
    
    // Nếu đã chọn đáp án này rồi, bỏ chọn (toggle)
    if (answers[questionId] === answer) {
      console.log('Bỏ chọn đáp án:', answer, 'cho câu hỏi:', questionId);
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });
      
      // Ẩn giải thích khi bỏ chọn
      setShowExplanation(prev => ({
        ...prev,
        [questionId]: false
      }));
      return;
    }
    
    console.log('Chọn đáp án mới:', answer, 'cho câu hỏi:', questionId);
    // Nếu chọn đáp án mới, chỉ giữ lại đáp án mới (như radio button)
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Kiểm tra ngay lập tức xem đáp án có đúng không
    const currentQ = questions && questions.length > 0 ? questions.find(q => q.Id === questionId) : null;
    if (currentQ && answer !== currentQ.CorrectAnswer) {
      // Nếu sai, hiển thị giải thích ngay lập tức
      setShowExplanation(prev => ({
        ...prev,
        [questionId]: true
      }));
    } else {
      // Nếu đúng, ẩn giải thích
      setShowExplanation(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
  };

  const handleHeaderClick = () => {
    console.log('Header clicked!');
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
    
    // Calculate score
    let correctCount = 0;
    if (questions && questions.length > 0) {
      questions.forEach(q => {
        if (answers[q.Id] === q.CorrectAnswer) {
          correctCount++;
        }
      });
    }
    
    const finalScore = Math.round((correctCount / (questions ? questions.length : 1)) * 100);
    setScore(finalScore);
    setShowResult(true);
  };

  const getQuestionStatus = (index) => {
    if (!questions || !questions[index]) return 'unanswered';
    
    const question = questions[index];
    if (answers[question.Id]) {
      return answers[question.Id] === question.CorrectAnswer ? 'correct' : 'incorrect';
    }
    return 'unanswered';
  };

  const getExplanation = (question) => {
    if (!question) return 'Không có giải thích cho câu hỏi này.';
    // Tạo giải thích dựa trên đáp án đúng
    const optionText = question[`Option${question.CorrectAnswer}`];
    return `Đáp án đúng là ${question.CorrectAnswer}: ${optionText}. Hãy đọc kỹ câu hỏi và các lựa chọn để hiểu rõ hơn về quy tắc giao thông.`;
  };

  if (loading) {
    return (
      <div className="practice-exam-container">
        {/* Background */}
        <div className="practice-exam-background">
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
    const isPassed = score >= 80;
    
    return (
      <div className="practice-exam-container">
        {/* Background */}
        <div className="practice-exam-background">
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
              {isPassed ? '✅' : '❌'}
            </div>
            
            <SplitText
              text={isPassed ? '🎉 Chúc mừng! Bạn đã đậu' : '😔 Rất tiếc! Bạn chưa đậu'}
              className="result-title"
              delay={30}
              duration={0.5}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="center"
            />
            
            <div className="result-score">
              {score}/100 điểm
            </div>
            
            <p className="result-description">
              Bạn trả lời đúng {correctAnswers}/{questions ? questions.length : 0} câu
            </p>
            
            <div className="result-buttons">
              <button 
                onClick={() => window.location.reload()}
                className="result-button primary"
              >
                Thi lại
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="result-button secondary"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="practice-exam-container">
        {/* Background */}
        <div className="practice-exam-background">
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
          <p style={{ color: '#ef4444', fontSize: '18px' }}>Không thể tải câu hỏi. Vui lòng thử lại!</p>
        </div>
      </div>
    );
  }

  const currentQ = questions && questions.length > 0 ? questions[currentQuestion] : null;
  
  console.log('Current question debug:', {
    currentQuestion,
    currentQId: currentQ?.Id,
    currentQText: currentQ?.QuestionText?.substring(0, 50) + '...',
    answers,
    showExplanation
  });

  return (
    <div className="practice-exam-container">
      {/* Background */}
      <div className="practice-exam-background">
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

      {/* Header */}
      <div className="practice-exam-header">
        <div className="header-content">
          <div className="header-brand" onClick={handleHeaderClick} style={{ cursor: 'pointer' }}>
            <span className="header-logo">🚗</span>
            <span className="header-title">Thi GPLX An Toàn Giao Thông</span>
          </div>
          
          <div className="header-actions">
            <button className="feedback-button">
              Góp ý
            </button>
          </div>
        </div>
      </div>

      {/* Popup xác nhận về homepage */}
      {showHomePopup && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <div className="home-popup-content">
              <h3>Xác nhận</h3>
              <p>Bạn có chắc chắn muốn về trang chủ? Tất cả tiến độ làm bài sẽ bị mất.</p>
              <div className="home-popup-buttons">
                <button onClick={handleConfirmHome} className="home-popup-btn confirm">
                  Có, về trang chủ
                </button>
                <button onClick={handleCancelHome} className="home-popup-btn cancel">
                  Không, tiếp tục làm bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Exam Header */}
        <div className="exam-header">
          <div className="exam-header-content">
            <div>
              <TextType
                key={`exam-title-${currentQuestion}`}
                text={[
                  `Đề thi thử - ${questions ? questions.length : 0} câu hỏi`,
                  `Bạn đang ở câu hỏi thứ ${currentQuestion + 1}`
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
              <span className="question-counter">
                Câu {currentQuestion + 1}/{questions ? questions.length : 0}
              </span>
              <div className="timer">
                <span>⏰</span>
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
                <div className="legend-color correct"></div>
                <span className="legend-text">Đúng</span>
              </div>
              <div className="legend-item">
                <div className="legend-color incorrect"></div>
                <span className="legend-text">Sai</span>
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
              </h3>
               
              <p className="question-text">
                {currentQ ? currentQ.QuestionText : 'Đang tải câu hỏi...'}
              </p>

              <div className="answer-options">
                {currentQ && ['A', 'B', 'C', 'D'].map(option => {
                  const optionText = currentQ[`Option${option}`];
                  if (!optionText) return null;
                   
                  const isSelected = answers[currentQ.Id] === option;
                  const isCorrect = option === currentQ.CorrectAnswer;
                  const isIncorrect = isSelected && option !== currentQ.CorrectAnswer;
                   
                  let optionClasses = 'answer-option';
                  if (isSelected) {
                    optionClasses += isCorrect ? ' selected correct' : ' selected incorrect';
                  } else if (isCorrect && answers[currentQ.Id]) {
                    optionClasses += ' correct-answer';
                  }
                   
                  return (
                    <label 
                      key={option}
                      className={optionClasses}
                    >
                      <input
                        type="checkbox"
                        name={`question-${currentQ.Id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(currentQ.Id, option)}
                        className="answer-radio"
                      />
                      <div className="answer-text">
                        <span className="answer-label">{option}.</span>
                        <span className="answer-content">{optionText}</span>
                        {isCorrect && answers[currentQ.Id] && (
                          <span className="answer-status correct">
                            ✅ Đúng
                          </span>
                        )}
                        {isIncorrect && (
                          <span className="answer-status incorrect">
                            ❌ Sai
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Hiển thị giải thích khi chọn sai */}
              {currentQ && showExplanation[currentQ.Id] && (
                <div className="explanation">
                  <div className="explanation-header">
                    <span>❌</span>
                    <span>Đáp án của bạn sai rồi!</span>
                  </div>
                   
                  <div className="explanation-section">
                    <div className="explanation-title correct">
                      Đáp án đúng:
                    </div>
                    <div className="explanation-content correct">
                      {currentQ.CorrectAnswer}. {currentQ[`Option${currentQ.CorrectAnswer}`]}
                    </div>
                  </div>
                   
                  <div className="explanation-section">
                    <div className="explanation-title explanation">
                      Giải thích:
                    </div>
                    <div className="explanation-content explanation">
                      {getExplanation(currentQ)}
                    </div>
                  </div>
                </div>
              )}
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
                  onClick={() => setCurrentQuestion(Math.min((questions ? questions.length : 0) - 1, currentQuestion + 1))}
                  disabled={currentQuestion === (questions ? questions.length : 0) - 1}
                  className="nav-button next"
                >
                  Sau →
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitted}
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

export default PracticeExam;
