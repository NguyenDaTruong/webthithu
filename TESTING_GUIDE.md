# 🧪 HƯỚNG DẪN TEST CHỨC NĂNG MỚI

## ✅ **ĐÃ TRIỂN KHAI THÀNH CÔNG:**

### 🔧 **Backend Changes:**
1. ✅ Thêm API mới: `GET /api/questions/official`
2. ✅ Giới hạn 20 câu hỏi thay vì 100 câu
3. ✅ Random thứ tự đáp án A, B, C, D
4. ✅ Lưu đáp án gốc để debug

### 🎨 **Frontend Changes:**
1. ✅ OfficialExam sử dụng API mới
2. ✅ Timer: 20 phút cho 20 câu hỏi
3. ✅ Cập nhật UI hiển thị "Đề thi thật"

## 🚀 **CÁCH TEST:**

### **Bước 1: Khởi động server**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

### **Bước 2: Test API trực tiếp**
```bash
# Test API mới
curl http://localhost:5000/api/questions/official

# Hoặc dùng test script
node test_official_exam_api.js
```

### **Bước 3: Test trên giao diện**
1. 🌐 Mở http://localhost:3000
2. 🔐 Đăng nhập tài khoản
3. 📝 Vào trang Profile, hoàn thiện hồ sơ
4. 🏆 Click "Thi thật" 
5. ✅ Kiểm tra:
   - Chỉ có 20 câu hỏi
   - Timer hiển thị 20:00
   - Đáp án A, B, C, D được random
   - Mỗi lần refresh có câu hỏi khác nhau

## 🎯 **KẾT QUẢ MONG ĐỢI:**

### ✅ **Thi thật (OfficialExam):**
- **Số câu hỏi:** 20 câu (thay vì 100 câu)
- **Thời gian:** 20 phút (1 phút/câu)
- **Random câu hỏi:** Mỗi lần thi khác nhau
- **Random đáp án:** A, B, C, D được xáo trộn
- **API endpoint:** `/api/questions/official`

### ✅ **Thi thử (PracticeExam):**
- **Số câu hỏi:** Tất cả câu hỏi (không đổi)
- **Thời gian:** 10 phút (không đổi)
- **API endpoint:** `/api/questions` (không đổi)

## 🐛 **DEBUG INFO:**

Nếu có vấn đề, kiểm tra:
1. **Console log:** `Loaded official exam questions: 20`
2. **Network tab:** Request đến `/api/questions/official`
3. **Database:** Đảm bảo có đủ câu hỏi với `IsActive = 1`

## 📊 **PERFORMANCE:**

- **Trước:** Load 100 câu hỏi
- **Sau:** Load 20 câu hỏi
- **Cải thiện:** 80% giảm tải
- **Thời gian load:** Nhanh hơn đáng kể

