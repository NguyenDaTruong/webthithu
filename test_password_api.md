# Test API Đổi Mật Khẩu và Quên Mật Khẩu

## Tổng Quan
Chức năng quên mật khẩu đã được cập nhật để yêu cầu xác thực thông tin cá nhân và cho phép đổi mật khẩu trực tiếp sau khi xác thực thành công (trong môi trường development).

## Bước 1: Cập nhật Database
Chạy script SQL sau trong SQL Server:

```sql
-- Thêm các trường cần thiết vào bảng Users
ALTER TABLE [dbo].[Users] 
ADD ResetToken NVARCHAR(500) NULL,
    ResetTokenExpires DATETIME NULL;

-- Tạo index để tối ưu hiệu suất
CREATE INDEX IX_Users_ResetToken ON [dbo].[Users] (ResetToken);
CREATE INDEX IX_Users_Email ON [dbo].[Users] (Email);
```

## Bước 2: Khởi động Backend
```bash
cd backend
npm start
```

## Bước 3: Test API với Postman/Thunder Client

### Test Change Password API
```
POST http://localhost:5000/api/auth/change-password
Headers:
  Content-Type: application/json
  Authorization: Bearer <your_jwt_token>

Body:
{
  "currentPassword": "mật khẩu hiện tại",
  "newPassword": "mật khẩu mới"
}
```

### Test Forgot Password API (Đã cập nhật)
```
POST http://localhost:5000/api/auth/forgot-password
Headers:
  Content-Type: application/json

Body:
{
  "email": "email@example.com",
  "phone": "0123456789",
  "idCard": "123456789012",
  "dateOfBirth": "1990-01-01"
}
```

**Lưu ý**: API mới yêu cầu 4 trường thông tin để xác thực:
- Email
- Số điện thoại  
- CCCD/CMND
- Ngày sinh

### Test Reset Password API
```
POST http://localhost:5000/api/auth/reset-password
Headers:
  Content-Type: application/json

Body:
{
  "resetToken": "token từ forgot password",
  "newPassword": "mật khẩu mới"
}
```

## Bước 4: Test Frontend

### Test Đổi Mật Khẩu
1. **Đăng nhập** vào hệ thống
2. **Vào Profile** → Tab "Mật khẩu"
3. **Nhập mật khẩu hiện tại** và **mật khẩu mới**
4. **Click "Cập nhật mật khẩu"**
5. **Kiểm tra toast notification**

### Test Quên Mật Khẩu (Luồng mới - Development)
1. **Trên trang đăng nhập**, click "Quên mật khẩu?"
2. **Nhập đầy đủ thông tin**:
   - Email
   - Số điện thoại
   - CCCD/CMND
   - Ngày sinh
3. **Click "Xác thực thông tin"**
4. **Sau khi xác thực thành công**:
   - Hiển thị thông báo: "Xác thực thành công! Bạn có thể đặt lại mật khẩu ngay bây giờ."
   - Hiển thị form đổi mật khẩu với:
     - Thông tin tài khoản đã xác thực
     - Trường nhập mật khẩu mới
     - Trường xác nhận mật khẩu mới
5. **Nhập mật khẩu mới** và **xác nhận**
6. **Click "Đặt lại mật khẩu"**
7. **Kết quả**: 
   - Thông báo thành công
   - Tự động chuyển về trang đăng nhập sau 3 giây

## Luồng Hoạt Động Mới (Development)

### Quên Mật Khẩu - 2 Bước
1. **Bước 1: Xác thực thông tin**
   - User click "Quên mật khẩu?" trên trang đăng nhập
   - Nhập 4 trường thông tin để xác thực
   - Hệ thống xác thực thông tin với database
   - Nếu đúng: Chuyển sang bước 2
   - Nếu sai: Hiển thị lỗi cụ thể

2. **Bước 2: Đổi mật khẩu trực tiếp**
   - Hiển thị form đổi mật khẩu
   - User nhập mật khẩu mới và xác nhận
   - Hệ thống cập nhật mật khẩu
   - Chuyển về trang đăng nhập

### Đặt Lại Mật Khẩu (Production)
1. User sử dụng token từ bước trước
2. Truy cập `/reset-password?token=<resetToken>`
3. Nhập mật khẩu mới và xác nhận
4. Hệ thống cập nhật mật khẩu

## Lỗi Thường Gặp

### 1. "getToken is not defined"
- **Nguyên nhân**: Chưa import `getToken` từ `auth.js`
- **Giải pháp**: Đã sửa trong ProfilePage.js

### 2. "Thông tin xác thực không chính xác"
- **Nguyên nhân**: Email, SĐT, CCCD/CMND, ngày sinh không khớp với database
- **Giải pháp**: Kiểm tra lại thông tin đã nhập

### 3. "Vui lòng điền đầy đủ thông tin"
- **Nguyên nhân**: Thiếu một trong 4 trường bắt buộc
- **Giải pháp**: Điền đầy đủ tất cả trường

### 4. "Mật khẩu xác nhận không khớp"
- **Nguyên nhân**: Mật khẩu mới và xác nhận không giống nhau
- **Giải pháp**: Nhập lại mật khẩu xác nhận

## Kiểm Tra Logs

### Backend Console
```bash
# Kiểm tra connection database
Connected to SQL Server successfully

# Kiểm tra API calls
Forgot password error: [error details]
Change password error: [error details]
```

### Frontend Console
```bash
# Kiểm tra API response
Auth error: [error details]
```

## Success Case

### Đổi Mật Khẩu
- Toast notification: "Đổi mật khẩu thành công!"
- Form được reset
- Không có lỗi trong console

### Quên Mật Khẩu (Development)
- **Bước 1**: Toast notification: "Xác thực thành công! Bạn có thể đặt lại mật khẩu ngay bây giờ."
- **Bước 2**: Form đổi mật khẩu hiển thị với thông tin user đã xác thực
- **Kết quả**: Toast notification: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới."
- Tự động chuyển về trang đăng nhập sau 3 giây

## Bảo Mật

### Xác Thực Thông Tin
- **4 trường bắt buộc**: Email, SĐT, CCCD/CMND, Ngày sinh
- **So sánh chính xác** với database
- **Không tiết lộ** thông tin về sự tồn tại của email

### Token Reset
- **Thời hạn 1 giờ**
- **Mã hóa JWT**
- **Xóa sau khi sử dụng**
- **Không thể sử dụng lại**

## Chuyển Đổi Production

### Khi triển khai production:
1. **Thay đổi logic frontend**:
   - Sau khi xác thực thành công, không hiển thị form đổi mật khẩu
   - Thay vào đó, gửi token qua email
   - User sử dụng link trong email để đặt lại mật khẩu

2. **Cập nhật backend**:
   - Thêm logic gửi email với token reset
   - Không trả về token trong response
   - Chỉ trả về thông báo "Kiểm tra email"

3. **Sử dụng trang ResetPasswordPage**:
   - User truy cập `/reset-password?token=<token>`
   - Nhập mật khẩu mới
   - Xác nhận và cập nhật

## Troubleshooting

1. **Kiểm tra Network tab** trong DevTools
2. **Kiểm tra Response** từ API
3. **Kiểm tra Database** có được update không
4. **Kiểm tra JWT token** có hợp lệ không
5. **Kiểm tra thông tin xác thực** có chính xác không
6. **Kiểm tra mật khẩu mới** có đủ 6 ký tự không
