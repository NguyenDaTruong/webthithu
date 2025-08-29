# Chức Năng Quản Lý Mật Khẩu

## Tổng Quan
Dự án đã được cập nhật với đầy đủ chức năng quản lý mật khẩu bao gồm:
- ✅ Đổi mật khẩu (Change Password)
- ✅ Quên mật khẩu (Forgot Password)
- ✅ Đặt lại mật khẩu (Reset Password)

## Cài Đặt Database

### 1. Chạy Script SQL
```sql
-- Thêm các trường cần thiết vào bảng Users
ALTER TABLE [dbo].[Users] 
ADD ResetToken NVARCHAR(500) NULL,
    ResetTokenExpires DATETIME NULL;

-- Tạo index để tối ưu hiệu suất
CREATE INDEX IX_Users_ResetToken ON [dbo].[Users] (ResetToken);
CREATE INDEX IX_Users_Email ON [dbo].[Users] (Email);
```

### 2. Kiểm tra cấu trúc bảng
```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users' 
ORDER BY ORDINAL_POSITION;
```

## API Endpoints

### 1. Đổi Mật Khẩu
```
POST /api/auth/change-password
Authorization: Bearer <token>
Body: {
  "currentPassword": "mật khẩu hiện tại",
  "newPassword": "mật khẩu mới"
}
```

### 2. Quên Mật Khẩu
```
POST /api/auth/forgot-password
Body: {
  "email": "email@example.com"
}
```

### 3. Đặt Lại Mật Khẩu
```
POST /api/auth/reset-password
Body: {
  "resetToken": "token từ email",
  "newPassword": "mật khẩu mới"
}
```

## Luồng Hoạt Động

### Đổi Mật Khẩu
1. Người dùng đăng nhập vào hệ thống
2. Vào trang Profile → Tab "Mật khẩu"
3. Nhập mật khẩu hiện tại và mật khẩu mới
4. Hệ thống xác thực và cập nhật mật khẩu

### Quên Mật Khẩu
1. Người dùng click "Quên mật khẩu?" trên trang đăng nhập
2. Nhập email đã đăng ký
3. Hệ thống gửi token reset qua email (hiện tại hiển thị trên UI)
4. Người dùng copy token và truy cập link reset password

### Đặt Lại Mật Khẩu
1. Người dùng truy cập `/reset-password?token=<resetToken>`
2. Nhập mật khẩu mới và xác nhận
3. Hệ thống xác thực token và cập nhật mật khẩu
4. Chuyển hướng về trang đăng nhập

## Bảo Mật

### Token Reset Password
- Token có thời hạn 1 giờ
- Token được mã hóa bằng JWT
- Token bị xóa sau khi sử dụng
- Không thể sử dụng lại token đã dùng

### Validation
- Mật khẩu mới phải có ít nhất 6 ký tự
- Xác nhận mật khẩu phải khớp
- Mật khẩu hiện tại phải đúng
- Email phải tồn tại trong hệ thống

## Frontend Components

### 1. ProfilePage.js
- Tab "Mật khẩu" với form đổi mật khẩu
- Validation real-time
- Toast notification cho kết quả

### 2. AuthPage.js
- Chế độ "Quên mật khẩu"
- Form gửi yêu cầu reset
- Chuyển đổi giữa các chế độ

### 3. ResetPasswordPage.js
- Trang riêng để đặt lại mật khẩu
- Xử lý token từ URL parameter
- Validation và feedback

## CSS Styling

### Success Message
```css
.success-message {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-line;
}
```

## Testing

### Test Cases
1. **Đổi mật khẩu thành công**
   - Nhập đúng mật khẩu hiện tại
   - Mật khẩu mới hợp lệ
   - Xác nhận mật khẩu khớp

2. **Đổi mật khẩu thất bại**
   - Sai mật khẩu hiện tại
   - Mật khẩu mới quá ngắn
   - Xác nhận mật khẩu không khớp

3. **Quên mật khẩu**
   - Email tồn tại
   - Email không tồn tại
   - Token được tạo thành công

4. **Reset mật khẩu**
   - Token hợp lệ
   - Token hết hạn
   - Token không tồn tại

## Lưu Ý Production

### Email Service
Trong môi trường production, cần:
1. Tích hợp email service (SendGrid, AWS SES, etc.)
2. Gửi token reset qua email thay vì hiển thị trên UI
3. Template email chuyên nghiệp
4. Rate limiting cho API forgot-password

### Security
1. Sử dụng HTTPS
2. Rate limiting cho tất cả API
3. Logging và monitoring
4. Backup và recovery plan

## Troubleshooting

### Lỗi Thường Gặp
1. **Database connection failed**
   - Kiểm tra connection string
   - Kiểm tra SQL Server service

2. **Token không hợp lệ**
   - Kiểm tra JWT_SECRET
   - Kiểm tra thời gian hết hạn

3. **Email không gửi được**
   - Kiểm tra cấu hình email service
   - Kiểm tra network connectivity

## Hỗ Trợ
Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs
2. Kiểm tra database logs
3. Kiểm tra network requests
4. Liên hệ team development

