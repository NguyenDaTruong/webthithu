import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ExamPage from './pages/ExamPage';
import CertificatePage from './pages/CertificatePage';
import CardNav from './components/CardNav';

const navItems = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Company", ariaLabel: "About Company" },
      { label: "Careers", ariaLabel: "About Careers" }
    ]
  },
  {
    label: "Projects", 
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Featured", ariaLabel: "Featured Projects" },
      { label: "Case Studies", ariaLabel: "Project Case Studies" }
    ]
  },
  {
    label: "Contact",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Email", ariaLabel: "Contact via Email" },
      { label: "LinkedIn", ariaLabel: "Contact on LinkedIn" }
    ]
  }
];

function App() {
  return (
    <Router>
      {/* Xóa hoặc comment dòng này nếu chỉ muốn nav ở HomePage */}
      {/* <CardNav items={navItems} menuColor="#fff" /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/certificate" element={<CertificatePage />} />
      </Routes>
    </Router>
  );
}

export default App;