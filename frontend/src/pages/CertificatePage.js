import React, { useState, useRef } from 'react';
import DarkVeil from '../components/DarkVeil';
import '../styles/CertificatePage.css';

const CertificatePage = () => {
  const certificateRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dữ liệu mẫu - sau này sẽ lấy từ hồ sơ người dùng
  const [certificateData, setCertificateData] = useState({
    fullName: "NGUYỄN VĂN AN",
    birthDate: "15/03/1990",
    birthPlace: "Hà Nội",
    major: "Lái xe ô tô hạng B2",
    completionStatus: "Hoàn thành",
    organization: "Trung tâm Đào tạo Lái xe An Toàn",
    issueDate: "20/11/2024",
    validFrom: "20/11/2024",
    validTo: "20/11/2029",
    location: "Hà Nội",
    certificateNumber: "VN-2024-001234"
  });

  const generatePDF = async () => {
    setIsLoading(true);
    
    try {
      // Sử dụng html2canvas và jsPDF để tạo PDF
      const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')).default;
      const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const element = certificateRef.current;
      if (!element) return;

      // Capture the certificate as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`chung-chi-giao-thong-${certificateData.certificateNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="certificate-container">
      {/* Background */}
      <div className="background-container">
        <DarkVeil
          speed={0.5}
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Header Controls */}
        <div className="controls-header">
          <div className="controls-content">
            <h1>Chứng Chỉ An Toàn Giao Thông</h1>
            <div className="controls-buttons">
              <button 
                className="btn btn-primary" 
                onClick={generatePDF}
                disabled={isLoading}
              >
                {isLoading ? 'Đang tạo PDF...' : '📄 Xuất PDF'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={printCertificate}
              >
                🖨️ In chứng chỉ
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => window.history.back()}
              >
                ← Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Certificate */}
        <div className="certificate-wrapper">
          <div ref={certificateRef} className="certificate" id="certificate">
            {/* Header */}
            <div className="certificate-header">
              <div className="header-left">
                
                <div className="ministry-text">
                  <div className="ministry-name">BỘ GIAO THÔNG VẬN TẢI</div>
                  <div className="ministry-sub">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="ministry-motto">Độc lập - Tự do - Hạnh phúc</div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="certificate-title">
              <h1>CHỨNG CHỈ</h1>
              <h2>THẨM TRA VIÊN AN TOÀN GIAO THÔNG ĐƯỜNG BỘ</h2>
              <div className="authority">TỔNG CỤC TRƯỞNG TỔNG CỤC ĐƯỜNG BỘ VIỆT NAM</div>
            </div>

            {/* Content */}
            <div className="certificate-content">
              <div className="photo-section">
                <div className="photo-placeholder">
                  <div className="photo-text">
                    <div>Ảnh 4 x 6</div>
                    <div className="photo-note">
                      {/* (dóng dấu nổi<br/>
                      của cơ quan<br/>
                      trực tiếp<br/>
                      cấp chứng chỉ) */}
                    </div>
                  </div>
                </div>
                
                <div className="certificate-number">
                  <strong>Số:</strong> {certificateData.certificateNumber}
                </div>
                <div className="issue-info">
                  Có giá trị đến<br/>
                  ngày: {certificateData.validTo.split('/')[0]} tháng {certificateData.validTo.split('/')[1]} năm {certificateData.validTo.split('/')[2]}
                </div>
              </div>

              <div className="info-section">
                <div className="info-row">
                  <span className="label">Cấp cho:</span>
                  <span className="value">{certificateData.fullName}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Sinh ngày:</span>
                  <span className="value">{certificateData.birthDate}</span>
                  <span className="label-right">Tại:</span>
                  <span className="value">{certificateData.birthPlace}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Trình độ chuyên môn:</span>
                  <span className="value">{certificateData.major}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Đã hoàn thành:</span>
                  <span className="value">{certificateData.completionStatus}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Tổ chức tại:</span>
                  <span className="value">{certificateData.organization}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Từ ngày:</span>
                  <span className="value">{certificateData.validFrom}</span>
                  <span className="label-right">Đến ngày:</span>
                  <span className="value">{certificateData.validTo}</span>
                </div>
                
                <div className="location-date">
                  <em>{certificateData.location}, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
