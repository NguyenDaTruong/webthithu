# 🛠️ HƯỚNG DẪN KHẮC PHỤC SỰ CỐ - HỆ THỐNG TẠO ĐỀ THI

## 🚨 Lỗi thường gặp: "Invalid column name 'IsActive'"

### **Nguyên nhân:**
- Cột `IsActive` không tồn tại trong bảng `Questions`
- Cột `IsCritical` có thể không tồn tại
- Cấu trúc database không khớp với code

### **Cách khắc phục:**

#### **Bước 1: Kiểm tra cấu trúc database**
1. Vào trang tạo đề thi
2. Nhấn nút **"🔍 Kiểm tra cấu trúc database"**
3. Xem thông tin cột trong bảng Questions

#### **Bước 2: Chạy script SQL để sửa database**
1. Mở SQL Server Management Studio
2. Kết nối đến database của bạn
3. Chạy script `check_database_structure.sql`
4. Kiểm tra kết quả

#### **Bước 3: Kiểm tra lại chức năng**
1. Refresh trang web
2. Thử tạo đề thi lại
3. Kiểm tra console log

---

## 🔍 **Các bước debug chi tiết:**

### **1. Kiểm tra backend server**
```bash
# Trong thư mục backend
npm start
# Kiểm tra console có lỗi gì không
```

### **2. Kiểm tra database connection**
```bash
# Kiểm tra file .env có đúng thông tin database không
DB_USER=your_username
DB_PASSWORD=your_password
DB_SERVER=your_server
DB_DATABASE=your_database
```

### **3. Kiểm tra API endpoints**
```bash
# Test API trực tiếp
curl http://localhost:5000/api/questions/check-structure
curl http://localhost:5000/api/questions/create-default-exam?examType=practice
```

---

## 📋 **Danh sách kiểm tra:**

### **Backend:**
- [ ] Server đang chạy trên port 5000
- [ ] Database connection thành công
- [ ] C
- [ ] Không có lỗi syntax trong codeác routes đã được đăng ký

### **Database:**
- [ ] Bảng `Questions` tồn tại
- [ ] Có dữ liệu trong bảng
- [ ] Cột `Category` có giá trị hợp lệ
- [ ] Cột `IsCritical` đã được thêm (nếu cần)

### **Frontend:**
- [ ] Component `ExamGenerator` được import đúng
- [ ] CSS file được load
- [ ] Không có lỗi JavaScript trong console
- [ ] API calls được gọi đúng endpoint

---

## 🚀 **Giải pháp nhanh:**

### **Nếu lỗi vẫn tiếp tục:**

1. **Restart backend server:**
   ```bash
   # Ctrl+C để dừng
   npm start
   ```

2. **Clear browser cache:**
   - F12 → Application → Storage → Clear storage
   - Refresh trang

3. **Kiểm tra database trực tiếp:**
   ```sql
   SELECT TOP 10 * FROM [dbo].[Questions]
   ```

4. **Tạo cột IsCritical nếu chưa có:**
   ```sql
   ALTER TABLE [dbo].[Questions] ADD IsCritical BIT DEFAULT 0
   ```

---

## 📞 **Liên hệ hỗ trợ:**

### **Thông tin cần cung cấp:**
1. **Lỗi cụ thể:** Copy toàn bộ error message
2. **Console log:** Screenshot console browser
3. **Database structure:** Kết quả từ nút "Kiểm tra cấu trúc database"
4. **Steps to reproduce:** Các bước để tái hiện lỗi

### **Channels hỗ trợ:**
- 📧 Email: support@trafficexam.com
- 💬 Discord: #support channel
- 📱 Telegram: @trafficexam_support

---

## ✅ **Kiểm tra sau khi sửa:**

### **Test case 1: Tạo đề thi mặc định**
1. Vào trang thi thử
2. Nhấn "⚡ Tạo đề thi mặc định"
3. Kiểm tra có tạo được đề thi không

### **Test case 2: Tạo đề thi tùy chỉnh**
1. Chọn số câu hỏi: 15
2. Chọn hạng bằng: A1
3. Chọn thời gian: 15 phút
4. Nhấn "🎯 Tạo đề thi tùy chỉnh"
5. Kiểm tra có tạo được đề thi không

### **Test case 3: Kiểm tra xáo trộn đáp án**
1. Tạo đề thi với "Xáo trộn thứ tự đáp án" = ON
2. Làm bài và kiểm tra đáp án có bị xáo trộn không
3. Kiểm tra đáp án đúng có khớp với thứ tự mới không

---

## 🎯 **Kết quả mong đợi:**

Sau khi khắc phục sự cố, hệ thống sẽ:
- ✅ Tạo đề thi thành công
- ✅ Random câu hỏi mỗi lần
- ✅ Xáo trộn đáp án A, B, C, D
- ✅ Cập nhật đáp án đúng theo thứ tự mới
- ✅ Hiển thị thông tin đề thi chi tiết
- ✅ Timer hoạt động chính xác

---

**Lưu ý:** Nếu vẫn gặp vấn đề, hãy cung cấp đầy đủ thông tin lỗi để team có thể hỗ trợ tốt nhất! 🚀






