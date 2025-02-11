import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import StudentAdmission from "./components/StudentAdmission";
import StudentDetails from "./components/StudentDetails";
import LunchFees from "./components/LunchFees";
import TracksuitFees from "./components/TracksuitFees";
import LunchFeesDashboard from "./components/LunchFeesDashboard";
import TracksuitFeesDashboard from "./components/TracksuitFeesDashboard";
import { getStudents } from "./services/FirebaseService";

const App = () => {
  const handleSelectStudent = async (admissionNumber, navigate) => {
    const students = await getStudents();
    const selectedStudent = students[admissionNumber];
    navigate(`/studentDetails/${admissionNumber}`, { state: { student: selectedStudent } });
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard onSelectStudent={handleSelectStudent} />
              </ProtectedRoute>
            }
          />
          <Route path="/addStudent" element={<ProtectedRoute><StudentAdmission /></ProtectedRoute>} />
          <Route path="/studentDetails/:admissionNumber" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
          <Route path="/lunchFees" element={<ProtectedRoute><LunchFeesDashboard /></ProtectedRoute>} />
          <Route path="/lunchFees/:admissionNumber" element={<ProtectedRoute><LunchFees /></ProtectedRoute>} />
          <Route path="/tracksuitFees" element={<ProtectedRoute><TracksuitFeesDashboard /></ProtectedRoute>} />
          <Route path="/tracksuitFees/:admissionNumber" element={<ProtectedRoute><TracksuitFees /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
