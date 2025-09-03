-- Script cập nhật category cho câu hỏi hiện có
-- Chạy script này để chuyển đổi category từ "AnToanGiaoThong" sang các category chuẩn

PRINT '=== KIỂM TRA DỮ LIỆU HIỆN TẠI ===';

-- Kiểm tra các category hiện có
SELECT DISTINCT Category, COUNT(*) as QuestionCount 
FROM [dbo].[Questions] 
GROUP BY Category 
ORDER BY Category;

PRINT '=== CẬP NHẬT CATEGORY CHO CÂU HỎI HIỆN CÓ ===';

-- Cập nhật category từ "AnToanGiaoThong" và "An toàn giao thông" sang các category chuẩn
-- Phân bổ đều cho các category A1, A2, B1, B2, C1, C2

-- Cập nhật 1/6 số câu hỏi thành A1
UPDATE TOP(5) [dbo].[Questions] 
SET Category = 'A1'
WHERE Category IN (N'AnToanGiaoThong', N'An toàn giao thông')
AND Id NOT IN (SELECT TOP(0) Id FROM [dbo].[Questions] WHERE Category IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

PRINT 'Đã cập nhật 5 câu hỏi thành category A1';

-- Cập nhật 1/6 số câu hỏi thành A2
UPDATE TOP(5) [dbo].[Questions] 
SET Category = 'A2'
WHERE Category IN (N'AnToanGiaoThong', N'An toàn giao thông')
AND Id NOT IN (SELECT TOP(0) Id FROM [dbo].[Questions] WHERE Category IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

PRINT 'Đã cập nhật 5 câu hỏi thành category A2';

-- Cập nhật 1/6 số câu hỏi thành B1
UPDATE TOP(5) [dbo].[Questions] 
SET Category = 'B1'
WHERE Category IN (N'AnToanGiaoThong', N'An toàn giao thông')
AND Id NOT IN (SELECT TOP(0) Id FROM [dbo].[Questions] WHERE Category IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

PRINT 'Đã cập nhật 5 câu hỏi thành category B1';

-- Cập nhật 1/6 số câu hỏi thành B2
UPDATE TOP(5) [dbo].[Questions] 
SET Category = 'B2'
WHERE Category IN (N'AnToanGiaoThong', N'An toàn giao thông')
AND Id NOT IN (SELECT TOP(0) Id FROM [dbo].[Questions] WHERE Category IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

PRINT 'Đã cập nhật 5 câu hỏi thành category B2';

-- Cập nhật 1/6 số câu hỏi thành C1
UPDATE TOP(5) [dbo].[Questions] 
SET Category = 'C1'
WHERE Category IN (N'AnToanGiaoThong', N'An toàn giao thông')
AND Id NOT IN (SELECT TOP(0) Id FROM [dbo].[Questions] WHERE Category IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

PRINT 'Đã cập nhật 5 câu hỏi thành category C1';

-- Cập nhật 1/6 số câu hỏi thành C2
UPDATE TOP(5) [dbo].[Questions] 
SET Category = 'C2'
WHERE Category IN (N'AnToanGiaoThong', N'An toàn giao thông')
AND Id NOT IN (SELECT TOP(0) Id FROM [dbo].[Questions] WHERE Category IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

PRINT 'Đã cập nhật 5 câu hỏi thành category C2';

PRINT '=== CẬP NHẬT CỘT ISCRITICAL ===';

-- Cập nhật cột IsCritical cho một số câu hỏi
-- Chọn 5 câu hỏi đầu tiên của mỗi category để làm câu điểm liệt

UPDATE [dbo].[Questions] 
SET IsCritical = 1
WHERE Id IN (
    SELECT TOP(5) Id 
    FROM [dbo].[Questions] 
    WHERE Category = 'A1'
    ORDER BY Id
);

UPDATE [dbo].[Questions] 
SET IsCritical = 1
WHERE Id IN (
    SELECT TOP(5) Id 
    FROM [dbo].[Questions] 
    WHERE Category = 'A2'
    ORDER BY Id
);

UPDATE [dbo].[Questions] 
SET IsCritical = 1
WHERE Id IN (
    SELECT TOP(5) Id 
    FROM [dbo].[Questions] 
    WHERE Category = 'B1'
    ORDER BY Id
);

UPDATE [dbo].[Questions] 
SET IsCritical = 1
WHERE Id IN (
    SELECT TOP(5) Id 
    FROM [dbo].[Questions] 
    WHERE Category = 'B2'
    ORDER BY Id
);

UPDATE [dbo].[Questions] 
SET IsCritical = 1
WHERE Id IN (
    SELECT TOP(5) Id 
    FROM [dbo].[Questions] 
    WHERE Category = 'C1'
    ORDER BY Id
);

UPDATE [dbo].[Questions] 
SET IsCritical = 1
WHERE Id IN (
    SELECT TOP(5) Id 
    FROM [dbo].[Questions] 
    WHERE Category = 'C2'
    ORDER BY Id
);

PRINT 'Đã cập nhật cột IsCritical cho các câu hỏi';

PRINT '=== KIỂM TRA KẾT QUẢ SAU KHI CẬP NHẬT ===';

-- Kiểm tra các category sau khi cập nhật
SELECT DISTINCT Category, COUNT(*) as QuestionCount 
FROM [dbo].[Questions] 
GROUP BY Category 
ORDER BY Category;

-- Kiểm tra số câu hỏi điểm liệt
SELECT Category, COUNT(*) as CriticalCount
FROM [dbo].[Questions] 
WHERE IsCritical = 1
GROUP BY Category
ORDER BY Category;

-- Kiểm tra mẫu câu hỏi
SELECT TOP 10 Id, QuestionText, Category, IsCritical
FROM [dbo].[Questions]
ORDER BY Category, Id;

PRINT '=== HOÀN THÀNH CẬP NHẬT CATEGORY ===';
PRINT 'Bây giờ bạn có thể test lại chức năng tạo đề thi!';
PRINT 'Các category đã được cập nhật: A1, A2, B1, B2, C1, C2';
PRINT 'Mỗi category có 5 câu hỏi điểm liệt (IsCritical = 1)';
