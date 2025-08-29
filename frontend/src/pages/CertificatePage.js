import React, { useState, useRef, useEffect } from 'react';
import DarkVeil from '../components/DarkVeil';
import '../styles/CertificatePage.css';
import { API_BASE, getToken, getUser } from '../utils/auth';

const CertificatePage = () => {
  const certificateRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState('');
  const [cert, setCert] = useState(null);
  const [savingName, setSavingName] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  // Dữ liệu chứng chỉ hiển thị (đồng bộ từ API)
  const [certificateData, setCertificateData] = useState({
    examScore: null,
    examDate: '',
    certificateNumber: ''
  });

  // Tải trạng thái chứng chỉ
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const token = getToken();
        if (!token) {
          setStatusError('Bạn cần đăng nhập để xem chứng chỉ.');
          setLoadingStatus(false);
          return;
        }
        const res = await fetch(`${API_BASE}/api/certificate/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setStatusError(data?.message || 'Không thể tải trạng thái chứng chỉ.');
          setLoadingStatus(false);
          return;
        }
        if (!data?.hasCertificate) {
          setCert(null);
          setLoadingStatus(false);
          return;
        }
        const c = data.certificate;
        setCert(c);
        // Đồng bộ tên và dữ liệu hiển thị
        setUserName(c.certificateName || '');
        setCertificateData({
          examScore: typeof c.score === 'number' ? c.score : null,
          examDate: c.issuedAt ? String(c.issuedAt).slice(0, 10) : '',
          certificateNumber: c.Id ? `CERT-${c.Id}` : ''
        });
        
      } catch (e) {
        setStatusError('Lỗi kết nối server.');
      } finally {
        setLoadingStatus(false);
      }
    };
    loadStatus();
  }, []);

  const reloadStatus = async () => {
    setLoadingStatus(true);
    setStatusError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/certificate/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data?.hasCertificate) {
        const c = data.certificate;
        setCert(c);
        setUserName(c.certificateName || '');
        setCertificateData({
          examScore: typeof c.score === 'number' ? c.score : null,
          examDate: c.issuedAt ? String(c.issuedAt).slice(0, 10) : '',
          certificateNumber: c.Id ? `CERT-${c.Id}` : ''
        });
      } else {
        setCert(null);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  };

  const saveCertificateName = async () => {
    if (!userName || !userName.trim()) return;
    setSavingName(true);
    setStatusError('');
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/certificate/issue-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ certificateName: userName.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusError(data?.message || 'Không thể lưu tên chứng chỉ.');
        return;
      }
      const updated = data.certificate;
      setCert(updated);
      setCertificateData((prev) => ({
        examScore: typeof updated.score === 'number' ? updated.score : prev.examScore,
        examDate: updated.issuedAt ? String(updated.issuedAt).slice(0, 10) : prev.examDate,
        certificateNumber: updated.Id ? `CERT-${updated.Id}` : prev.certificateNumber
      }));
      setIsEditing(false);
    } catch (e) {
      setStatusError('Lỗi kết nối server khi lưu tên chứng chỉ.');
    } finally {
      setSavingName(false);
    }
  };

  const devMarkPass = async () => {
    try {
      const current = getUser();
      
      if (!current || current.id !== 1) {
        
        return;
      }
      setDevLoading(true);
      const token = getToken();
      
      const res = await fetch(`${API_BASE}/api/certificate/dev-pass`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        // Refresh status to reflect new eligibility
        setCert(data.certificate || null);
        setStatusError('');
        await reloadStatus();
      } else {
        setStatusError(data?.message || 'Không thể đánh dấu đậu (dev)');
      }
    } catch (e) {
      
      setStatusError('Lỗi kết nối server khi đánh dấu đậu (dev).');
    } finally {
      setDevLoading(false);
    }
  };

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
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 portrait width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`traffic-safety-certificate-${certificateData.certificateNumber}.pdf`);
      
    } catch (error) {
      
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
  };

  const handleNameClick = () => {
    setIsEditing(true);
  };

  if (loadingStatus) {
    return (
      <div className="certificate-page-container">
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
        <div className="content-wrapper">
          <div className="controls-header"><div className="controls-content"><h1>Traffic Safety Certificate</h1></div></div>
          <div style={{ padding: 24, color: '#cfcfe1' }}>Đang tải trạng thái chứng chỉ...</div>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="certificate-page-container">
        <div className="background-container">
          <DarkVeil speed={0.5} hueShift={0} noiseIntensity={0} scanlineIntensity={0} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
        </div>
        <div className="content-wrapper">
          <div className="controls-header"><div className="controls-content"><h1>Traffic Safety Certificate</h1></div></div>
          <div style={{ padding: 24, color: '#ef4444' }}>{statusError}</div>
        </div>
      </div>
    );
  }

  // Chưa có bản ghi chứng chỉ
  if (!cert) {
    return (
      <div className="certificate-page-container">
        <div className="background-container">
          <DarkVeil speed={0.5} hueShift={0} noiseIntensity={0} scanlineIntensity={0} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
        </div>
        <div className="content-wrapper">
          <div className="controls-header"><div className="controls-content"><h1>Traffic Safety Certificate</h1></div></div>
          <div style={{ padding: 24, color: '#cfcfe1' }}>
            Bạn chưa có kết quả thi để cấp chứng chỉ hoặc chưa đạt điều kiện.
            {getUser() && getUser().id === 1 && (
              <div style={{ marginTop: 12 }}>
                <button onClick={devMarkPass} className="btn btn-outline" disabled={devLoading}>
                  {devLoading ? 'Đang đánh dấu...' : 'Dev: Đánh dấu đậu'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Có chứng chỉ: nếu chưa đậu
  if (!cert.isPassed) {
    return (
      <div className="certificate-page-container">
        <div className="background-container">
          <DarkVeil speed={0.5} hueShift={0} noiseIntensity={0} scanlineIntensity={0} scanlineFrequency={0} warpAmount={0} resolutionScale={1} />
        </div>
        <div className="content-wrapper">
          <div className="controls-header"><div className="controls-content"><h1>Traffic Safety Certificate</h1></div></div>
          <div style={{ padding: 24, color: '#cfcfe1' }}>Kết quả hiện tại chưa đạt điều kiện. Điểm: {certificateData.examScore ?? '-'} / 10</div>
        </div>
      </div>
    );
  }

  // Đã đậu: hiển thị chứng chỉ, cho nhập tên nếu chưa khóa
  return (
    <div className="certificate-page-container">
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
            <h1>Traffic Safety Certificate</h1>
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
              {getUser() && getUser().id === 1 && (
                <button
                  className="btn btn-primary"
                  onClick={async ()=>{
                    try {
                      const token = getToken();
                      const res = await fetch(`${API_BASE}/api/certificate/dev-pass`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                      const data = await res.json();
                      if (res.ok) {
                        setStatusError('');
                        await reloadStatus();
                      } else {
                        setStatusError(data?.message || 'Không thể đánh dấu đậu (dev-pass)');
                      }
                    } catch (e) {
                      setStatusError('Lỗi kết nối server (dev-pass)');
                    }
                  }}
                >
                  Dev: Đánh dấu đậu & tạo Result
                </button>
              )}
              {getUser() && getUser().id === 1 && (
                <button
                  className="btn btn-outline"
                  onClick={devMarkPass}
                  disabled={devLoading}
                  title="Chỉ dành cho admin (ID=1) trong môi trường dev"
                >
                  {devLoading ? 'Đang đánh dấu...' : 'Dev: Đánh dấu đậu'}
                </button>
              )}
              {!cert.isLocked && (
                <button
                  className="btn btn-primary"
                  onClick={saveCertificateName}
                  disabled={savingName || !userName || !userName.trim()}
                >
                  {savingName ? 'Đang lưu...' : '💾 Lưu & khóa tên'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Certificate Container */}
        <div className="certificate-wrapper">
          <div ref={certificateRef} className="certificate-container" id="certificate">
            <div className="corner-decoration top-left"></div>
            <div className="corner-decoration bottom-right"></div>
            
            <div className="certificate-inner">
              {/* Certificate Header */}
              <div className="certificate-header">TRAFFIC SAFETY CERTIFICATE</div>

              {/* Body Section */}
              <div className="certificate-body">
                <div className="certificate-intro">
                  This is to certify that
                </div>
                
                <div className="recipient-name-section">
                  {(!cert.isLocked && isEditing) ? (
                    <input
                      type="text"
                      value={userName}
                      onChange={handleNameChange}
                      onBlur={handleNameBlur}
                      className="name-input"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className={`recipient-name ${!cert.isLocked ? 'editable' : ''}`}
                      onClick={() => { if (!cert.isLocked) handleNameClick(); }}
                    >
                      {userName || 'NHẬP HỌ TÊN'}
                    </div>
                  )}
                </div>
                
                <div className="certificate-completion">
                  successfully completed the exam
                </div>
                
                <div className="exam-type">
                  TRAFFIC SAFETY
                </div>
              </div>

              {/* Footer Section - Fixed at bottom */}
              <div className="certificate-footer">
                <div className="footer-left">
                  <div className="footer-date">
                    <em>Ha Noi, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</em>
                  </div>
                  <div className="footer-qr">
                    <div className="qr-placeholder">{certificateData.certificateNumber || 'CERT'}</div>
                  </div>
                </div>
                
                <div className="footer-right">
                  <div className="signature-section">
                    <div className="signature-title">CHIEF EXECUTIVE OFFICER</div>
                    <div className="signature-line"></div>
                    <div className="signature-name">TRAFFIC EXAM</div>
                    <div className="signature-subtitle">TrafficExam Website</div>
                  </div>
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
