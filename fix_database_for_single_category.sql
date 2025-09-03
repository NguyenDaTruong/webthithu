-- Script sửa database cho chứng chỉ an toàn giao thông
-- Chỉ có 1 category duy nhất và 5 câu điểm liệt

PRINT '=== KIỂM TRA DỮ LIỆU HIỆN TẠI ===';

-- Kiểm tra các category hiện có
SELECT DISTINCT Category, COUNT(*) as QuestionCount 
FROM [dbo].[Questions] 
GROUP BY Category 
ORDER BY Category;

-- Kiểm tra số câu hỏi điểm liệt hiện tại
SELECT COUNT(*) as TotalCriticalQuestions
FROM [dbo].[Questions] 
WHERE IsCritical = 1;

PRINT '=== SỬA DATABASE CHO 1 CATEGORY DUY NHẤT ===';

-- Cập nhật tất cả câu hỏi thành category "AnToanGiaoThong"
UPDATE [dbo].[Questions] 
SET Category = 'AnToanGiaoThong'
WHERE Category IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

PRINT 'Đã cập nhật tất cả câu hỏi thành category AnToanGiaoThong';

-- Reset tất cả câu hỏi về không phải điểm liệt
UPDATE [dbo].[Questions] 
SET IsCritical = 0;

PRINT 'Đã reset tất cả câu hỏi về không phải điểm liệt';

-- Chọn 5 câu hỏi đầu tiên làm câu điểm liệt (sửa cú pháp)
UPDATE [dbo].[Questions] 
SET IsCritical = 1
WHERE Id IN (
    SELECT TOP(5) Id 
    FROM [dbo].[Questions] 
    ORDER BY Id
);

PRINT 'Đã chọn 5 câu hỏi đầu tiên làm câu điểm liệt';

PRINT '=== KIỂM TRA KẾT QUẢ SAU KHI SỬA ===';

-- Kiểm tra category sau khi sửa
SELECT DISTINCT Category, COUNT(*) as QuestionCount 
FROM [dbo].[Questions] 
GROUP BY Category 
ORDER BY Category;

-- Kiểm tra số câu hỏi điểm liệt
SELECT COUNT(*) as TotalCriticalQuestions
FROM [dbo].[Questions] 
WHERE IsCritical = 1;

-- Kiểm tra mẫu câu hỏi
SELECT TOP 10 Id, QuestionText, Category, IsCritical
FROM [dbo].[Questions]
ORDER BY Id;

PRINT '=== HOÀN THÀNH SỬA DATABASE ===';
PRINT 'Bây giờ database chỉ có 1 category: AnToanGiaoThong';
PRINT 'Chỉ có 5 câu hỏi điểm liệt (IsCritical = 1)';
PRINT 'Bạn có thể test lại chức năng tạo đề thi!';
