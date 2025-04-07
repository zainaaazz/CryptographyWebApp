import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import AESPage from "./AESPage";
import DESPage from "./DESPage";
import CaesarPage from "./CaesarPage";
import { Lock, ShieldCheck, KeyRound } from "lucide-react"; // icons
import './App.css';

function NavButtons() {
  const { pathname } = useLocation();

  const buttons = [
    { to: "/aes", label: "AES", icon: <Lock size={20} /> },
    { to: "/des", label: "DES", icon: <ShieldCheck size={20} /> },
    { to: "/caesar", label: "Caesar", icon: <KeyRound size={20} /> }
  ];

  return (
    <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
      {buttons.map(({ to, label, icon }) => (
        <Link
          key={to}
          to={to}
          className={`crypto-btn ${pathname === to ? "active-btn animate" : ""}`}
        >
          {icon} <span className="ms-2">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-dark text-white d-flex flex-column justify-content-center align-items-center p-4">
        <h1 className="display-4 mb-4">CRYPTOGRAPHY PROJECT</h1>
        <p className="lead mb-4">Choose an encryption algorithm:</p>
        <NavButtons />
        <Routes>
          <Route path="/aes" element={<AESPage />} />
          <Route path="/des" element={<DESPage />} />
          <Route path="/caesar" element={<CaesarPage />} />
        </Routes>
      </div>
    </Router>
  );
}
