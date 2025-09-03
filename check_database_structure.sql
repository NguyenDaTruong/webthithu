-- Script kiểm tra và sửa cấu trúc database cho hệ thống tạo đề thi
-- Chạy từng phần một để kiểm tra và sửa lỗi

PRINT '=== KIỂM TRA CẤU TRÚC BẢNG QUESTIONS ===';

-- 1. Kiểm tra cấu trúc bảng Questions hiện tại
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    ORDINAL_POSITION
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Questions'
ORDER BY ORDINAL_POSITION;

PRINT '=== KIỂM TRA DỮ LIỆU MẪU ===';

-- 2. Kiểm tra dữ liệu mẫu trong bảng Questions
SELECT TOP 5 
    Id,
    QuestionText,
    OptionA,
    OptionB,
    OptionC,
    OptionD,
    CorrectAnswer,
    Category
FROM [dbo].[Questions];

PRINT '=== KIỂM TRA CÁC GIÁ TRỊ CATEGORY ===';

-- 3. Kiểm tra các giá trị Category có sẵn
SELECT DISTINCT Category, COUNT(*) as QuestionCount
FROM [dbo].[Questions]
GROUP BY Category
ORDER BY Category;

PRINT '=== THÊM CỘT ISCRITICAL NẾU CHƯA CÓ ===';

-- 4. Thêm cột IsCritical nếu chưa có
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Questions' AND COLUMN_NAME = 'IsCritical'
)
BEGIN
    ALTER TABLE [dbo].[Questions] 
    ADD IsCritical BIT DEFAULT 0;
    
    PRINT 'Đã thêm cột IsCritical vào bảng Questions';
    
    -- Cập nhật một số câu hỏi mẫu thành câu điểm liệt
    UPDATE TOP(5) [dbo].[Questions] 
    SET IsCritical = 1 
    WHERE Id IN (1, 2, 3, 4, 5);
    
    PRINT 'Đã cập nhật 5 câu hỏi đầu tiên thành câu điểm liệt';
END
ELSE
BEGIN
    PRINT 'Cột IsCritical đã tồn tại';
END

PRINT '=== KIỂM TRA KẾT QUẢ SAU KHI SỬA ===';

-- 5. Kiểm tra kết quả sau khi sửa
SELECT TOP 10 
    Id,
    QuestionText,
    OptionA,
    OptionB,
    OptionC,
    OptionD,
    CorrectAnswer,
    Category,
    IsCritical
FROM [dbo].[Questions]
ORDER BY Id;

PRINT '=== TẠO INDEX ĐỂ TĂNG TỐC ĐỘ TRUY VẤN ===';

-- 6. Tạo index để tăng tốc độ truy vấn
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Questions_Category')
BEGIN
    CREATE INDEX IX_Questions_Category ON [dbo].[Questions] (Category);
    PRINT 'Đã tạo index IX_Questions_Category';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Questions_IsCritical')
BEGIN
    CREATE INDEX IX_Questions_IsCritical ON [dbo].[Questions] (IsCritical);
    PRINT 'Đã tạo index IX_Questions_IsCritical';
END

PRINT '=== HOÀN THÀNH KIỂM TRA VÀ SỬA DATABASE ===';
PRINT 'Bây giờ bạn có thể test lại chức năng tạo đề thi!';
