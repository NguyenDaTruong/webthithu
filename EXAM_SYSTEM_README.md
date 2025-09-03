# 🎯 HỆ THỐNG TẠO ĐỀ THI - TRAFFIC EXAM

## 📋 Tổng quan

Hệ thống tạo đề thi mới được thiết kế để tạo ra các đề thi với câu hỏi random và đáp án được xáo trộn, đảm bảo mỗi lần thi sẽ có trải nghiệm khác nhau.

## ✨ Tính năng chính

### 🔀 Random câu hỏi
- Mỗi lần tạo đề thi sẽ có câu hỏi khác nhau
- Sử dụng `ORDER BY NEWID()` trong SQL Server để random
- Hỗ trợ lọc theo category và số lượng câu hỏi

### 🔀 Xáo trộn đáp án
- Thứ tự A, B, C, D được thay đổi ngẫu nhiên
- Hệ thống tự động cập nhật đáp án đúng theo thứ tự mới
- Đảm bảo tính nhất quán giữa đáp án và câu trả lời

### ⚙️ Tùy chỉnh linh hoạt
- Số lượng câu hỏi: 10, 15, 20, 25, 30, 40, 50
- Hạng bằng: A1, A2, B1, B2, C1, C2
- Thời gian: 10, 15, 20, 25, 30, 45, 60 phút
- Tùy chọn xáo trộn đáp án
- Tùy chọn bao gồm câu điểm liệt

## 🏗️ Kiến trúc hệ thống

### Backend APIs

#### 1. Tạo đề thi tùy chỉnh
```http
POST /api/questions/create-exam
Content-Type: application/json

{
  "examType": "practice|official",
  "questionCount": 25,
  "category": "A1",
  "timeLimit": 20,
  "shuffleAnswers": true,
  "includeCritical": true
}
```

#### 2. Tạo đề thi mặc định
```http
GET /api/questions/create-default-exam?examType=practice
```

#### 3. Lấy thông tin đề thi
```http
GET /api/questions/exam/:examId
```

### Frontend Components

#### 1. ExamGenerator
- Component chính để tạo đề thi
- Giao diện tùy chỉnh cấu hình
- Hỗ trợ cả thi thử và thi thật

#### 2. PracticeExam (Cập nhật)
- Sử dụng ExamGenerator để tạo đề thi
- Hiển thị thông tin đề thi trong kết quả
- Nút tạo đề thi mới

#### 3. OfficialExam (Cập nhật)
- Tương tự PracticeExam
- Tích hợp với hệ thống chống gian lận
- Ghi nhận kết quả cho chứng chỉ

## 🔧 Cách hoạt động

### 1. Quy trình tạo đề thi
```
User → Chọn cấu hình → Gọi API → Random câu hỏi → Xáo trộn đáp án → Tạo đề thi
```

### 2. Thuật toán xáo trộn đáp án
```javascript
// 1. Tạo mảng đáp án với key và value
const options = [
  { key: 'A', value: question.OptionA },
  { key: 'B', value: question.OptionB },
  { key: 'C', value: question.OptionC },
  { key: 'D', value: question.OptionD }
];

// 2. Xáo trộn mảng
for (let i = options.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [options[i], options[j]] = [options[j], options[i]];
}

// 3. Cập nhật đáp án mới
shuffledQuestion.OptionA = options[0].value;
shuffledQuestion.OptionB = options[1].value;
// ...

// 4. Cập nhật đáp án đúng
const correctOption = options.find(opt => opt.key === question.CorrectAnswer);
const newCorrectIndex = options.findIndex(opt => opt.value === correctOption.value);
const newCorrectKey = ['A', 'B', 'C', 'D'][newCorrectIndex];
shuffledQuestion.CorrectAnswer = newCorrectKey;
```

### 3. Cấu trúc dữ liệu đề thi
```javascript
{
  examId: "EXAM_1234567890_abc123",
  examType: "practice|official",
  questionCount: 25,
  category: "A1",
  timeLimit: 1200, // giây
  totalQuestions: 25,
  criticalQuestions: 5,
  createdAt: "2024-01-01T00:00:00.000Z",
  questions: [
    {
      Id: 1,
      QuestionText: "Câu hỏi...",
      OptionA: "Đáp án A",
      OptionB: "Đáp án B",
      OptionC: "Đáp án C",
      OptionD: "Đáp án D",
      CorrectAnswer: "B", // Đã được cập nhật theo thứ tự mới
      IsCritical: true,
      Category: "A1"
    }
  ]
}
```

## 🎨 Giao diện người dùng

### 1. ExamGenerator
- Header với tiêu đề và mô tả
- Cấu hình cơ bản: số câu hỏi, hạng bằng, thời gian
- Tùy chọn nâng cao: xáo trộn đáp án, câu điểm liệt
- Nút tạo đề thi tùy chỉnh và mặc định
- Thông tin về tính năng hệ thống

### 2. Kết quả thi
- Hiển thị điểm số và trạng thái đậu/rớt
- Thông tin đề thi: số câu, câu điểm liệt, hạng bằng, thời gian
- Cảnh báo câu điểm liệt nếu có
- Nút tạo đề thi mới

## 🚀 Triển khai

### 1. Backend
```bash
# Các API đã được thêm vào questionController.js
# Routes đã được cập nhật trong questionRoutes.js
```

### 2. Frontend
```bash
# Component ExamGenerator đã được tạo
# PracticeExam và OfficialExam đã được cập nhật
# CSS đã được thêm vào ExamGenerator.css
```

### 3. Database
- Không cần thay đổi cấu trúc database
- Sử dụng các bảng hiện có: Questions, Users, Certificates

## 🔒 Bảo mật và kiểm soát

### 1. Chống gian lận
- Mỗi lần tạo đề thi có câu hỏi khác nhau
- Đáp án được xáo trộn ngẫu nhiên
- Không thể dự đoán trước cấu trúc đề thi

### 2. Kiểm soát truy cập
- API tạo đề thi không yêu cầu authentication (cho thi thử)
- API thi thật yêu cầu đăng nhập và hoàn thiện hồ sơ

### 3. Logging và monitoring
- Log các lần tạo đề thi
- Theo dõi thời gian làm bài
- Ghi nhận kết quả thi

## 📱 Responsive Design

- Hỗ trợ đa thiết bị: Desktop, Tablet, Mobile
- Giao diện thích ứng với kích thước màn hình
- Touch-friendly cho thiết bị di động

## 🧪 Testing

### 1. Test tạo đề thi
- Tạo đề thi với các cấu hình khác nhau
- Kiểm tra tính random của câu hỏi
- Kiểm tra xáo trộn đáp án

### 2. Test tính nhất quán
- Đáp án đúng phải khớp với thứ tự mới
- Không được mất thông tin câu hỏi
- Thời gian phải được tính đúng

### 3. Test performance
- Thời gian tạo đề thi < 2 giây
- Không bị lag khi xáo trộn đáp án
- Memory usage ổn định

## 🔮 Tính năng tương lai

### 1. Lưu trữ đề thi
- Lưu đề thi vào database
- Cho phép xem lại đề thi đã làm
- So sánh kết quả giữa các lần thi

### 2. Tạo đề thi theo chủ đề
- Lọc câu hỏi theo chủ đề cụ thể
- Tạo đề thi chuyên sâu
- Đề thi theo cấp độ khó

### 3. Export/Import đề thi
- Xuất đề thi ra file PDF
- Import đề thi từ file Excel
- Chia sẻ đề thi giữa các người dùng

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng:
1. Kiểm tra console log
2. Kiểm tra network tab
3. Kiểm tra database connection
4. Liên hệ team development

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 2024-01-01  
**Tác giả**: Traffic Exam Team






