-- Script thêm dữ liệu mẫu vào bảng Questions
-- Chạy script này nếu bảng Questions không có dữ liệu

PRINT '=== KIỂM TRA DỮ LIỆU HIỆN TẠI ===';

-- Kiểm tra số lượng câu hỏi hiện tại
SELECT COUNT(*) as TotalQuestions FROM [dbo].[Questions];

-- Kiểm tra các category có sẵn
SELECT DISTINCT Category, COUNT(*) as QuestionCount 
FROM [dbo].[Questions] 
GROUP BY Category 
ORDER BY Category;

PRINT '=== THÊM DỮ LIỆU MẪU NẾU CẦN ===';

-- Thêm dữ liệu mẫu nếu bảng trống
IF NOT EXISTS (SELECT TOP 1 * FROM [dbo].[Questions])
BEGIN
    PRINT 'Bảng Questions trống, đang thêm dữ liệu mẫu...';
    
    INSERT INTO [dbo].[Questions] (QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Category, Explanation, IsCritical)
    VALUES 
    -- Câu hỏi A1
    ('Khi gặp biển báo hiệu có hình tròn viền đỏ, nền trắng, chữ số đen, bạn phải làm gì?', 'Giảm tốc độ', 'Dừng lại', 'Tăng tốc độ', 'Đi bình thường', 'B', 'A1', 'Biển báo có hình tròn viền đỏ, nền trắng, chữ số đen là biển cấm, bạn phải dừng lại.', 1),
    
    ('Xe mô tô 2 bánh, xe gắn máy được phép chở tối đa bao nhiêu người?', '1 người', '2 người', '3 người', '4 người', 'B', 'A1', 'Xe mô tô 2 bánh, xe gắn máy được phép chở tối đa 2 người.', 1),
    
    ('Khi điều khiển xe mô tô, bạn phải đội mũ bảo hiểm như thế nào?', 'Đội mũ bảo hiểm có cài quai đúng quy cách', 'Chỉ cần đội mũ bảo hiểm', 'Không cần đội mũ bảo hiểm', 'Đội mũ bảo hiểm nhưng không cài quai', 'A', 'A1', 'Khi điều khiển xe mô tô, bạn phải đội mũ bảo hiểm có cài quai đúng quy cách.', 1),
    
    ('Tốc độ tối đa cho phép xe mô tô trong khu vực đông dân cư là bao nhiêu?', '30 km/h', '40 km/h', '50 km/h', '60 km/h', 'C', 'A1', 'Tốc độ tối đa cho phép xe mô tô trong khu vực đông dân cư là 50 km/h.', 0),
    
    ('Khi gặp đèn tín hiệu giao thông màu đỏ, bạn phải làm gì?', 'Đi chậm lại', 'Dừng lại trước vạch dừng', 'Tăng tốc độ để vượt qua', 'Đi bình thường', 'B', 'A1', 'Khi gặp đèn tín hiệu giao thông màu đỏ, bạn phải dừng lại trước vạch dừng.', 1),
    
    -- Câu hỏi A2
    ('Xe ô tô con được phép chở tối đa bao nhiêu người?', '4 người', '5 người', '6 người', '7 người', 'B', 'A2', 'Xe ô tô con được phép chở tối đa 5 người (tính cả người lái).', 0),
    
    ('Khi gặp biển báo hiệu có hình tam giác viền đỏ, nền trắng, bạn phải làm gì?', 'Dừng lại', 'Đi chậm lại và chú ý', 'Tăng tốc độ', 'Đi bình thường', 'B', 'A2', 'Biển báo có hình tam giác viền đỏ, nền trắng là biển cảnh báo, bạn phải đi chậm lại và chú ý.', 0),
    
    ('Tốc độ tối đa cho phép xe ô tô con trong khu vực đông dân cư là bao nhiêu?', '40 km/h', '50 km/h', '60 km/h', '70 km/h', 'C', 'A2', 'Tốc độ tối đa cho phép xe ô tô con trong khu vực đông dân cư là 60 km/h.', 0),
    
    ('Khi gặp đèn tín hiệu giao thông màu vàng, bạn phải làm gì?', 'Tăng tốc độ để vượt qua', 'Dừng lại trước vạch dừng', 'Đi chậm lại và chú ý', 'Đi bình thường', 'B', 'A2', 'Khi gặp đèn tín hiệu giao thông màu vàng, bạn phải dừng lại trước vạch dừng.', 1),
    
    ('Xe ô tô con được phép chở hàng hóa như thế nào?', 'Chở hàng hóa vượt quá trọng tải', 'Chở hàng hóa vượt quá kích thước', 'Chở hàng hóa đúng quy định', 'Chở hàng hóa tùy ý', 'C', 'A2', 'Xe ô tô con được phép chở hàng hóa đúng quy định.', 0),
    
    -- Câu hỏi B1
    ('Xe ô tô khách được phép chở tối đa bao nhiêu người?', '10 người', '15 người', '20 người', 'Tùy theo thiết kế', 'D', 'B1', 'Xe ô tô khách được phép chở tối đa tùy theo thiết kế của nhà sản xuất.', 0),
    
    ('Khi gặp biển báo hiệu có hình tròn viền đỏ, nền trắng, chữ số đen, bạn phải làm gì?', 'Giảm tốc độ', 'Dừng lại', 'Tăng tốc độ', 'Đi bình thường', 'B', 'B1', 'Biển báo có hình tròn viền đỏ, nền trắng, chữ số đen là biển cấm, bạn phải dừng lại.', 1),
    
    ('Tốc độ tối đa cho phép xe ô tô khách trong khu vực đông dân cư là bao nhiêu?', '50 km/h', '60 km/h', '70 km/h', '80 km/h', 'B', 'B1', 'Tốc độ tối đa cho phép xe ô tô khách trong khu vực đông dân cư là 60 km/h.', 0),
    
    ('Khi gặp đèn tín hiệu giao thông màu xanh, bạn phải làm gì?', 'Dừng lại', 'Đi chậm lại', 'Được phép đi', 'Đi bình thường', 'C', 'B1', 'Khi gặp đèn tín hiệu giao thông màu xanh, bạn được phép đi.', 0),
    
    ('Xe ô tô khách được phép chở hàng hóa như thế nào?', 'Chở hàng hóa vượt quá trọng tải', 'Chở hàng hóa vượt quá kích thước', 'Chở hàng hóa đúng quy định', 'Chở hàng hóa tùy ý', 'C', 'B1', 'Xe ô tô khách được phép chở hàng hóa đúng quy định.', 0),
    
    -- Câu hỏi B2
    ('Xe ô tô tải được phép chở tối đa bao nhiêu tấn?', 'Tùy theo thiết kế', '5 tấn', '10 tấn', '15 tấn', 'A', 'B2', 'Xe ô tô tải được phép chở tối đa tùy theo thiết kế của nhà sản xuất.', 0),
    
    ('Khi gặp biển báo hiệu có hình tam giác viền đỏ, nền trắng, bạn phải làm gì?', 'Dừng lại', 'Đi chậm lại và chú ý', 'Tăng tốc độ', 'Đi bình thường', 'B', 'B2', 'Biển báo có hình tam giác viền đỏ, nền trắng là biển cảnh báo, bạn phải đi chậm lại và chú ý.', 0),
    
    ('Tốc độ tối đa cho phép xe ô tô tải trong khu vực đông dân cư là bao nhiêu?', '40 km/h', '50 km/h', '60 km/h', '70 km/h', 'B', 'B2', 'Tốc độ tối đa cho phép xe ô tô tải trong khu vực đông dân cư là 50 km/h.', 0),
    
    ('Khi gặp đèn tín hiệu giao thông màu đỏ, bạn phải làm gì?', 'Đi chậm lại', 'Dừng lại trước vạch dừng', 'Tăng tốc độ để vượt qua', 'Đi bình thường', 'B', 'B2', 'Khi gặp đèn tín hiệu giao thông màu đỏ, bạn phải dừng lại trước vạch dừng.', 1),
    
    ('Xe ô tô tải được phép chở hàng hóa như thế nào?', 'Chở hàng hóa vượt quá trọng tải', 'Chở hàng hóa vượt quá kích thước', 'Chở hàng hóa đúng quy định', 'Chở hàng hóa tùy ý', 'C', 'B2', 'Xe ô tô tải được phép chở hàng hóa đúng quy định.', 0),
    
    -- Câu hỏi C1
    ('Xe ô tô khách có từ 10 đến 30 chỗ ngồi được phép chở tối đa bao nhiêu người?', '10 người', '15 người', '20 người', '30 người', 'D', 'C1', 'Xe ô tô khách có từ 10 đến 30 chỗ ngồi được phép chở tối đa 30 người.', 0),
    
    ('Khi gặp biển báo hiệu có hình tròn viền đỏ, nền trắng, chữ số đen, bạn phải làm gì?', 'Giảm tốc độ', 'Dừng lại', 'Tăng tốc độ', 'Đi bình thường', 'B', 'C1', 'Biển báo có hình tròn viền đỏ, nền trắng, chữ số đen là biển cấm, bạn phải dừng lại.', 1),
    
    ('Tốc độ tối đa cho phép xe ô tô khách có từ 10 đến 30 chỗ ngồi trong khu vực đông dân cư là bao nhiêu?', '50 km/h', '60 km/h', '70 km/h', '80 km/h', 'B', 'C1', 'Tốc độ tối đa cho phép xe ô tô khách có từ 10 đến 30 chỗ ngồi trong khu vực đông dân cư là 60 km/h.', 0),
    
    ('Khi gặp đèn tín hiệu giao thông màu xanh, bạn phải làm gì?', 'Dừng lại', 'Đi chậm lại', 'Được phép đi', 'Đi bình thường', 'C', 'C1', 'Khi gặp đèn tín hiệu giao thông màu xanh, bạn được phép đi.', 0),
    
    ('Xe ô tô khách có từ 10 đến 30 chỗ ngồi được phép chở hàng hóa như thế nào?', 'Chở hàng hóa vượt quá trọng tải', 'Chở hàng hóa vượt quá kích thước', 'Chở hàng hóa đúng quy định', 'Chở hàng hóa tùy ý', 'C', 'C1', 'Xe ô tô khách có từ 10 đến 30 chỗ ngồi được phép chở hàng hóa đúng quy định.', 0),
    
    -- Câu hỏi C2
    ('Xe ô tô khách có trên 30 chỗ ngồi được phép chở tối đa bao nhiêu người?', '30 người', '40 người', '50 người', 'Tùy theo thiết kế', 'D', 'C2', 'Xe ô tô khách có trên 30 chỗ ngồi được phép chở tối đa tùy theo thiết kế của nhà sản xuất.', 0),
    
    ('Khi gặp biển báo hiệu có hình tam giác viền đỏ, nền trắng, bạn phải làm gì?', 'Dừng lại', 'Đi chậm lại và chú ý', 'Tăng tốc độ', 'Đi bình thường', 'B', 'C2', 'Biển báo có hình tam giác viền đỏ, nền trắng là biển cảnh báo, bạn phải đi chậm lại và chú ý.', 0),
    
    ('Tốc độ tối đa cho phép xe ô tô khách có trên 30 chỗ ngồi trong khu vực đông dân cư là bao nhiêu?', '40 km/h', '50 km/h', '60 km/h', '70 km/h', 'B', 'C2', 'Tốc độ tối đa cho phép xe ô tô khách có trên 30 chỗ ngồi trong khu vực đông dân cư là 50 km/h.', 0),
    
    ('Khi gặp đèn tín hiệu giao thông màu đỏ, bạn phải làm gì?', 'Đi chậm lại', 'Dừng lại trước vạch dừng', 'Tăng tốc độ để vượt qua', 'Đi bình thường', 'B', 'C2', 'Khi gặp đèn tín hiệu giao thông màu đỏ, bạn phải dừng lại trước vạch dừng.', 1),
    
    ('Xe ô tô khách có trên 30 chỗ ngồi được phép chở hàng hóa như thế nào?', 'Chở hàng hóa vượt quá trọng tải', 'Chở hàng hóa vượt quá kích thước', 'Chở hàng hóa đúng quy định', 'Chở hàng hóa tùy ý', 'C', 'C2', 'Xe ô tô khách có trên 30 chỗ ngồi được phép chở hàng hóa đúng quy định.', 0);
    
    PRINT 'Đã thêm 30 câu hỏi mẫu vào bảng Questions';
END
ELSE
BEGIN
    PRINT 'Bảng Questions đã có dữ liệu, không cần thêm dữ liệu mẫu';
END

PRINT '=== KIỂM TRA KẾT QUẢ SAU KHI THÊM ===';

-- Kiểm tra số lượng câu hỏi sau khi thêm
SELECT COUNT(*) as TotalQuestions FROM [dbo].[Questions];

-- Kiểm tra các category có sẵn
SELECT DISTINCT Category, COUNT(*) as QuestionCount 
FROM [dbo].[Questions] 
GROUP BY Category 
ORDER BY Category;

-- Kiểm tra câu hỏi mẫu
SELECT TOP 5 Id, QuestionText, Category, IsCritical
FROM [dbo].[Questions]
ORDER BY Id;

PRINT '=== HOÀN THÀNH THÊM DỮ LIỆU MẪU ===';
PRINT 'Bây giờ bạn có thể test lại chức năng tạo đề thi!';






