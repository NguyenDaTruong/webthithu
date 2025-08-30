import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  FileText, 
  Archive,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import DarkVeil from '../components/DarkVeil';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('questions');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal states cho thông báo
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(5);
  
  // Current time
  const [currentTime, setCurrentTime] = useState(new Date());

  // User management states
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
      const [userFormData, setUserFormData] = useState({
      username: '',
      email: '',
      fullName: '',
      role: 'user'
    });
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form data for adding/editing questions
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    category: 'An toàn giao thông',
    numberOfOptions: 4, // Số lượng đáp án (2 hoặc 4)
    isCritical: false // Câu điểm liệt
  });

  const categories = ['An toàn giao thông'];

  useEffect(() => {
    // Kiểm tra quyền admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    loadQuestions();
    loadUsers();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [navigate]);

  const loadQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/questions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Reset ID từ 1 thay vì giữ nguyên ID từ database
        const questionsWithResetId = (data.data || []).map((question, index) => ({
          ...question,
          displayId: index + 1 // ID hiển thị từ 1
        }));
        setQuestions(questionsWithResetId);
      } else {
        console.error('Failed to load questions');
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Users API response:', data); // Debug log
        console.log('data type:', typeof data);
        console.log('data.data type:', typeof data.data);
        console.log('data.data isArray:', Array.isArray(data.data));
        if (data.data && typeof data.data === 'object') {
          console.log('data.data keys:', Object.keys(data.data));
          console.log('data.data values:', Object.values(data.data));
        }
        
        // Xử lý data linh hoạt - có thể data.data hoặc data trực tiếp
        let usersArray = [];
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (Array.isArray(data.data)) {
          usersArray = data.data;
        } else if (Array.isArray(data.users)) {
          usersArray = data.users;
        } else if (data.data && typeof data.data === 'object') {
          // Nếu data.data là object, có thể chứa users array
          console.log('data.data content:', data.data);
          if (Array.isArray(data.data.users)) {
            usersArray = data.data.users;
          } else if (Array.isArray(data.data.data)) {
            usersArray = data.data.data;
          } else {
            // Thử convert object thành array nếu có thể
            const dataKeys = Object.keys(data.data);
            console.log('data.data keys:', dataKeys);
            if (dataKeys.length > 0) {
              // Giả sử key đầu tiên chứa users array
              const firstKey = dataKeys[0];
              if (Array.isArray(data.data[firstKey])) {
                usersArray = data.data[firstKey];
                console.log('Found users in key:', firstKey, usersArray);
              }
            }
          }
        } else {
          console.warn('Unexpected users data format:', data);
          usersArray = [];
        }
        
        const usersWithResetId = usersArray.map((user, index) => ({
          ...user,
          displayId: index + 1
        }));
        setUsers(usersWithResetId);
              } else {
          console.error('Failed to load users:', response.status, response.statusText);
        }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    setSearchTerm(''); // Reset search term when changing tabs
    setSelectedCategory('all'); // Reset category filter when changing tabs
  };

  const handleAddQuestion = () => {
    setFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      category: 'An toàn giao thông',
      numberOfOptions: 4,
      isCritical: false
    });
    setShowAddModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.QuestionText || '',
      optionA: question.OptionA || '',
      optionB: question.OptionB || '',
      optionC: question.OptionC || '',
      optionD: question.OptionD || '',
      correctAnswer: question.CorrectAnswer || 'A',
      category: question.Category || 'An toàn giao thông',
      numberOfOptions: question.OptionC && question.OptionD ? 4 : 2, // Tự động detect số đáp án
      isCritical: question.IsCritical || false
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra câu hỏi trùng lặp (chỉ khi thêm mới)
    if (!showEditModal) {
      const isDuplicate = questions.some(question => 
        question.QuestionText?.toLowerCase().trim() === formData.questionText.toLowerCase().trim()
      );
      
      if (isDuplicate) {
        setShowDuplicateModal(true);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = showEditModal 
        ? `http://localhost:5000/api/admin/questions/${editingQuestion.Id}`
        : 'http://localhost:5000/api/admin/questions';
      
      const method = showEditModal ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingQuestion(null);
        loadQuestions(); // Reload questions
        
        // Hiện thông báo thành công
        const message = showEditModal ? 'Cập nhật câu hỏi thành công!' : 'Thêm câu hỏi mới thành công!';
        setSuccessMessage(message);
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        setSuccessMessage(`❌ ${error.message || 'Có lỗi xảy ra'}`);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      setSuccessMessage('❌ Có lỗi xảy ra khi kết nối với server');
      setShowSuccessModal(true);
    }
  };

  const handleDeleteQuestion = async (id) => {
    // Tìm câu hỏi để hiển thị thông tin trong popup xác nhận
    const questionToDelete = questions.find(q => q.Id === id);
    
    if (!questionToDelete) {
      setSuccessMessage('❌ Không tìm thấy câu hỏi để xóa');
      setShowSuccessModal(true);
      return;
    }
    
    // Hiện modal xác nhận xóa
    setQuestionToDelete(questionToDelete);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/questions/${questionToDelete.Id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadQuestions(); // Reload questions
        setSuccessMessage('✅ Xóa câu hỏi thành công!');
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        setSuccessMessage(`❌ ${error.message || 'Có lỗi xảy ra khi xóa câu hỏi'}`);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      setSuccessMessage('❌ Có lỗi xảy ra khi kết nối với server');
      setShowSuccessModal(true);
    } finally {
      setShowDeleteConfirmModal(false);
      setQuestionToDelete(null);
    }
  };

  // User management functions
  const handleAddUser = () => {
    setUserFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'user'
    });
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.Username || user.username || '',
      email: user.Email || user.email || '',
      fullName: user.FullName || user.fullName || '',
      role: user.Role || user.role || 'user'
    });
    setShowUserModal(true);
  };

  const handleViewUserDetail = (user) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingUser 
        ? `http://localhost:5000/api/admin/users/${editingUser.Id || editingUser.id}`
        : 'http://localhost:5000/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userFormData)
      });

      if (response.ok) {
        setShowUserModal(false);
        setEditingUser(null);
        loadUsers(); // Reload users
        
        const message = editingUser ? 'Cập nhật người dùng thành công!' : 'Thêm người dùng mới thành công!';
        setSuccessMessage(`✅ ${message}`);
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        setSuccessMessage(`❌ ${error.message || 'Có lỗi xảy ra'}`);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error submitting user:', err);
      setSuccessMessage('❌ Có lỗi xảy ra khi kết nối với server');
      setShowSuccessModal(true);
    }
  };

  const handleDeleteUser = async (id) => {
    const userToDelete = users.find(u => u.Id === id || u.id === id);
    
    if (!userToDelete) {
      setSuccessMessage('❌ Không tìm thấy người dùng để xóa');
      setShowSuccessModal(true);
      return;
    }
    
    // Popup xác nhận xóa với thông tin chi tiết
    const confirmMessage = `🗑️ Bạn có chắc chắn muốn xóa người dùng này?\n\n` +
                          `👤 Tên: ${userToDelete.FullName || userToDelete.fullName || userToDelete.Username || userToDelete.username}\n` +
                          `📧 Email: ${userToDelete.Email || userToDelete.email}\n` +
                          `🏷️ Vai trò: ${userToDelete.Role || userToDelete.role}\n\n` +
                          `⚠️ Hành động này không thể hoàn tác!`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadUsers(); // Reload users
        setSuccessMessage('✅ Xóa người dùng thành công!');
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        setSuccessMessage(`❌ ${error.message || 'Có lỗi xảy ra khi xóa người dùng'}`);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setSuccessMessage('❌ Có lỗi xảy ra khi kết nối với server');
      setShowSuccessModal(true);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.QuestionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.OptionA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.OptionB?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.OptionC?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.OptionD?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Sửa lỗi category filter - so sánh chính xác
    const matchesCategory = selectedCategory === 'all' || question.Category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.Username || user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.FullName || user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.Email || user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedCategory === 'all' || (user.Role || user.role) === selectedCategory;
    
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatTime = (date) => {
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', tab: 'dashboard' },
    { icon: Users, label: 'Quản lý người dùng', tab: 'users' },
    { icon: HelpCircle, label: 'Quản lý câu hỏi', tab: 'questions' },
    { icon: FileText, label: 'Quản lý thi', tab: 'exams' },
    { icon: Archive, label: 'Báo cáo', tab: 'reports' }
  ];

  const renderQuestionsTab = () => (
    <div className="admin-main">
      <div className="admin-dashboard-content">
        <h2>Quản lý câu hỏi</h2>
        <p>{filteredQuestions.length} câu hỏi tìm thấy</p>
        
        <div className="admin-actions">
          <button onClick={handleAddQuestion} className="admin-btn admin-btn-primary">
            <Plus size={20} />
            Thêm câu hỏi
          </button>
        </div>

        {/* Time Display và Filters ngang hàng */}
        <div className="admin-filters">
          {/* Time Display bên trái */}
          <div className="time-display">
            <span className="time-icon">🕐</span>
            <span className="time-text">{formatTime(currentTime)}</span>
          </div>

          {/* Search và Category bên phải */}
          <div className="search-category-group">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">Tất cả category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="questions-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Câu hỏi</th>
                <th>Category</th>
                <th>Đáp án đúng</th>
                <th>Điểm liệt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
                                {loading ? (
                    <tr>
                      <td colSpan="6" className="loading">Đang tải dữ liệu...</td>
                    </tr>
                  ) : currentQuestions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state">Không tìm thấy câu hỏi nào</td>
                    </tr>
              ) : (
                currentQuestions.map((question, index) => (
                  <tr key={question.Id}>
                    <td className="question-id">#{question.displayId || (indexOfFirstQuestion + index + 1)}</td>
                    <td className="question-text">
                      <div className="question-content">
                        <p>{question.QuestionText}</p>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{question.Category}</span>
                    </td>
                    <td>
                      <span className="correct-answer">{question.CorrectAnswer}</span>
                    </td>
                    <td>
                      {question.IsCritical ? (
                        <span className="critical-badge">🚨 Có</span>
                      ) : (
                        <span className="normal-badge">Bình thường</span>
                      )}
                    </td>
                    <td className="question-actions">
                      <button 
                        onClick={() => handleEditQuestion(question)}
                        className="action-btn edit-btn"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(question.Id)}
                        className="action-btn delete-btn"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredQuestions.length > questionsPerPage && (
          <div className="pagination-footer">
            <div className="pagination-info">
              Hiển thị {indexOfFirstQuestion + 1}-{Math.min(indexOfLastQuestion, filteredQuestions.length)} trong tổng số {filteredQuestions.length} câu hỏi
            </div>
            
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="admin-main">
      <div className="admin-dashboard-content">
        <h2>Quản lý người dùng</h2>
        <p>{filteredUsers.length} người dùng tìm thấy</p>
        
        <div className="admin-actions">
          <button onClick={handleAddUser} className="admin-btn admin-btn-primary">
            <Plus size={20} />
            Thêm người dùng
          </button>
        </div>

        {/* Time Display và Filters ngang hàng */}
        <div className="admin-filters">
          {/* Time Display bên trái */}
          <div className="time-display">
            <span className="time-icon">🕐</span>
            <span className="time-text">{formatTime(currentTime)}</span>
          </div>

          {/* Search và Category bên phải */}
          <div className="search-category-group">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="questions-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Thông tin người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">Không tìm thấy người dùng nào</td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.Id || user.id}>
                    <td className="question-id">#{user.displayId || (index + 1)}</td>
                    <td className="question-text">
                      <div className="question-content">
                        <p><strong>{user.FullName || user.fullName || user.Username || user.username}</strong></p>
                        <p style={{fontSize: '0.9rem', opacity: 0.8}}>{user.Email || user.email}</p>
                        <p style={{fontSize: '0.9rem', opacity: 0.6}}>@{user.Username || user.username}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${(user.Role || user.role) === 'admin' ? 'admin-role' : 'user-role'}`}>
                        {(user.Role || user.role) === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${(user.Status || user.status) === 'active' ? 'active-status' : 'inactive-status'}`}>
                        {(user.Status || user.status) === 'active' ? '🟢 Hoạt động' : '🔴 Không hoạt động'}
                      </span>
                    </td>
                    <td className="question-actions">
                      <button 
                        onClick={() => handleViewUserDetail(user)}
                        className="action-btn view-btn"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="action-btn edit-btn"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.Id || user.id)}
                        className="action-btn delete-btn"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'questions':
        return renderQuestionsTab();
      case 'dashboard':
        return <div className="admin-dashboard-content"><h2>Dashboard - Coming soon</h2></div>;
      case 'users':
        return renderUsersTab();
      case 'exams':
        return <div className="admin-dashboard-content"><h2>Quản lý thi - Coming soon</h2></div>;
      case 'reports':
        return <div className="admin-dashboard-content"><h2>Báo cáo - Coming soon</h2></div>;
      default:
        return renderQuestionsTab();
    }
  };

  return (
    <div className="admin-dashboard">
      {/* DarkVeil Background */}
      <div className="admin-background">
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

      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>TrafficExam</h2>
          <p>Admin Panel</p>
        </div>
        
        <nav className="admin-nav">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
              onClick={() => handleTabChange(item.tab)}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="admin-footer">
          <button 
            onClick={() => navigate('/')}
            className="back-btn"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
      
      {renderContent()}

      {/* Add Question Modal */}
      {showAddModal && (
        <QuestionModal
          title="Thêm câu hỏi mới"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowAddModal(false)}
          categories={categories}
        />
      )}

      {/* Edit Question Modal */}
      {showEditModal && (
        <QuestionModal
          title="Sửa câu hỏi"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowEditModal(false)}
          categories={categories}
        />
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          title={editingUser ? "Sửa người dùng" : "Thêm người dùng mới"}
          formData={userFormData}
          setFormData={setUserFormData}
          onSubmit={handleUserSubmit}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetailModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Duplicate Question Modal */}
      {showDuplicateModal && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <div className="home-popup-content">
              <h3>❌ Câu hỏi trùng lặp</h3>
              <p>Câu hỏi này đã tồn tại trong hệ thống! Vui lòng kiểm tra lại hoặc sửa đổi nội dung câu hỏi.</p>
              <div className="home-popup-buttons">
                <button onClick={() => setShowDuplicateModal(false)} className="home-popup-btn confirm">
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {showSuccessModal && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <div className="home-popup-content">
              <h3>{successMessage.includes('✅') ? 'Thành công!' : 'Thông báo'}</h3>
              <p>{successMessage}</p>
              <div className="home-popup-buttons">
                <button onClick={() => setShowSuccessModal(false)} className="home-popup-btn confirm">
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && questionToDelete && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <div className="home-popup-content">
              <h3>🗑️ Xác nhận xóa câu hỏi</h3>
              <p>
                Bạn có chắc chắn muốn xóa câu hỏi này?<br/><br/>
                <strong>📝 Nội dung:</strong> {questionToDelete.QuestionText?.substring(0, 100)}{questionToDelete.QuestionText?.length > 100 ? '...' : ''}<br/>
                <strong>🏷️ Category:</strong> {questionToDelete.Category}<br/>
                <strong>✅ Đáp án đúng:</strong> {questionToDelete.CorrectAnswer}<br/><br/>
                <span style={{color: '#ef4444'}}>⚠️ Hành động này không thể hoàn tác!</span>
              </p>
              <div className="home-popup-buttons">
                <button onClick={confirmDeleteQuestion} className="home-popup-btn confirm">
                  Xóa câu hỏi
                </button>
                <button onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setQuestionToDelete(null);
                }} className="home-popup-btn cancel">
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Question Modal Component
const QuestionModal = ({ title, formData, setFormData, onSubmit, onClose, categories }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={onSubmit} className="question-form">
          <div className="form-group">
            <label>Nội dung câu hỏi *</label>
            <textarea
              required
              value={formData.questionText}
              onChange={(e) => setFormData({...formData, questionText: e.target.value})}
              rows="3"
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

          {/* Chọn số lượng đáp án */}
          <div className="form-group">
            <label>Số lượng đáp án *</label>
            <select
              value={formData.numberOfOptions}
              onChange={(e) => {
                const newNumberOfOptions = parseInt(e.target.value);
                setFormData({
                  ...formData,
                  numberOfOptions: newNumberOfOptions,
                  // Reset đáp án C, D nếu chuyển về 2 đáp án
                  optionC: newNumberOfOptions === 2 ? '' : formData.optionC,
                  optionD: newNumberOfOptions === 2 ? '' : formData.optionD,
                  // Reset đáp án đúng nếu cần
                  correctAnswer: newNumberOfOptions === 2 && ['C', 'D'].includes(formData.correctAnswer) ? 'A' : formData.correctAnswer
                });
              }}
            >
              <option value={2}>2 đáp án (A, B)</option>
              <option value={4}>4 đáp án (A, B, C, D)</option>
            </select>
          </div>

          {/* Đáp án A - Luôn bắt buộc */}
          <div className="form-group">
            <label>Đáp án A *</label>
            <textarea
              required
              value={formData.optionA}
              onChange={(e) => setFormData({...formData, optionA: e.target.value})}
              placeholder="Đáp án A"
              rows="2"
              className="answer-textarea"
            />
          </div>

          {/* Đáp án B - Luôn bắt buộc */}
          <div className="form-group">
            <label>Đáp án B *</label>
            <textarea
              required
              value={formData.optionB}
              onChange={(e) => setFormData({...formData, optionB: e.target.value})}
              placeholder="Đáp án B"
              rows="2"
              className="answer-textarea"
            />
          </div>

          {/* Đáp án C - Chỉ hiện khi chọn 4 đáp án */}
          {formData.numberOfOptions >= 3 && (
            <div className="form-group">
              <label>Đáp án C *</label>
              <textarea
                required={formData.numberOfOptions >= 3}
                value={formData.optionC}
                onChange={(e) => setFormData({...formData, optionC: e.target.value})}
                placeholder="Đáp án C"
                rows="2"
                className="answer-textarea"
              />
            </div>
          )}

          {/* Đáp án D - Chỉ hiện khi chọn 4 đáp án */}
          {formData.numberOfOptions >= 4 && (
            <div className="form-group">
              <label>Đáp án D *</label>
              <textarea
                required={formData.numberOfOptions >= 4}
                value={formData.optionD}
                onChange={(e) => setFormData({...formData, optionD: e.target.value})}
                placeholder="Đáp án D"
                rows="2"
                className="answer-textarea"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Đáp án đúng *</label>
              <select
                required
                value={formData.correctAnswer}
                onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                {formData.numberOfOptions >= 3 && <option value="C">C</option>}
                {formData.numberOfOptions >= 4 && <option value="D">D</option>}
              </select>
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Câu điểm liệt */}
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isCritical"
              checked={formData.isCritical}
              onChange={(e) => setFormData({...formData, isCritical: e.target.checked})}
            />
            <label htmlFor="isCritical">
              🚨 Câu điểm liệt (Nếu trả lời sai câu này, bài thi sẽ không đạt)
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="admin-btn admin-btn-primary">
              {title.includes('Thêm') ? 'Thêm câu hỏi' : 'Cập nhật'}
            </button>
            <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Modal Component
const UserModal = ({ title, formData, setFormData, onSubmit, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={onSubmit} className="question-form">
          <div className="form-group">
            <label>Tên đăng nhập *</label>
            <input
              required
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Nhập email"
            />
          </div>

          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              required
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Nhập họ và tên"
            />
          </div>

                                <div className="form-group">
                        <label>Vai trò *</label>
                        <select
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

          <div className="form-actions">
            <button type="submit" className="admin-btn admin-btn-primary">
              {title.includes('Sửa') ? 'Cập nhật' : 'Thêm người dùng'}
            </button>
            <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ user, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Chi tiết người dùng</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="user-detail-content">
          <div className="user-detail-section">
            <h4>👤 Thông tin cơ bản</h4>
            <div className="detail-row">
              <span className="detail-label">Tên đăng nhập:</span>
              <span className="detail-value">@{user.Username || user.username}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Họ và tên:</span>
              <span className="detail-value">{user.FullName || user.fullName || 'Chưa cập nhật'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.Email || user.email}</span>
            </div>
          </div>

          <div className="user-detail-section">
            <h4>🏷️ Thông tin hệ thống</h4>
            <div className="detail-row">
              <span className="detail-label">Vai trò:</span>
              <span className={`detail-value ${(user.Role || user.role) === 'admin' ? 'admin-role' : 'user-role'}`}>
                {(user.Role || user.role) === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Trạng thái:</span>
              <span className={`detail-value ${(user.Status || user.status) === 'active' ? 'active-status' : 'inactive-status'}`}>
                {(user.Status || user.status) === 'active' ? '🟢 Hoạt động' : '🔴 Không hoạt động'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">ID:</span>
              <span className="detail-value">#{user.Id || user.id}</span>
            </div>
          </div>

          <div className="user-detail-section">
            <h4>📊 Thống kê</h4>
            <div className="detail-row">
              <span className="detail-label">Ngày tạo:</span>
              <span className="detail-value">{user.CreatedAt || user.createdAt || 'Chưa có thông tin'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Lần đăng nhập cuối:</span>
              <span className="detail-value">{user.LastLogin || user.lastLogin || 'Chưa có thông tin'}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="admin-btn admin-btn-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
