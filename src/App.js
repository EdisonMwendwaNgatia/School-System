import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom"; // Import Navigate
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import StudentAdmission from "./components/StudentAdmission";
import StudentDetails from "./components/StudentDetails";
import { getStudents } from "./services/FirebaseService";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSelectStudent = async (admissionNumber, navigate) => {
    const students = await getStudents();
    const selectedStudent = students[admissionNumber];
    navigate(`/studentDetails/${admissionNumber}`, { state: { student: selectedStudent } });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<Dashboard onSelectStudent={handleSelectStudent} />} />
        <Route path="/addStudent" element={<StudentAdmission />} />
        <Route path="/studentDetails/:admissionNumber" element={<StudentDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
