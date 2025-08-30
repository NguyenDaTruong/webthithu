-- Cập nhật một số câu hỏi mẫu để test
PRINT '=== CẬP NHẬT CÂU HỎI MẪU ===';
UPDATE [dbo].[Questions] 
SET 
    Explanation = N'Khi gặp đèn đỏ, tất cả các phương tiện phải dừng lại trước vạch dừng. Đây là quy tắc cơ bản để đảm bảo an toàn giao thông.',
    IsCritical = 1
WHERE Id = 1;

UPDATE [dbo].[Questions] 
SET 
    Explanation = N'Vượt xe phải đảm bảo an toàn, không được vượt khi có xe ngược chiều hoặc ở khúc cua.',
    IsCritical = 0
WHERE Id = 2;

PRINT 'Đã cập nhật câu hỏi mẫu!';