import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, deleteStudent, updateStudentFees } from "../services/FirebaseService";
import "./Dashboard.css";

const GRADE_FEES = {
  "1-3": {
    tuition: 11000,
    lunch: 2000,
    tracksuit: 1000,
  },
  "4-6": {
    tuition: 14000,
    lunch: 2000,
    tracksuit: 1000,
  },
  "7-9": {
    tuition: 18000,
    lunch: 2000,
    tracksuit: 1000,
  },
};

const Dashboard = () => {
  const [students, setStudents] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudents();
      setStudents(data);
    };
    fetchStudents();
  }, []);

  const handleDelete = async (admissionNumber) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete student ${admissionNumber}?`
    );
    if (confirmDelete) {
      await deleteStudent(admissionNumber);
      alert("Student deleted successfully!");
      const updatedStudents = await getStudents();
      setStudents(updatedStudents);
    }
  };

  const handleSelectStudent = (admissionNumber) => {
    navigate(`/studentDetails/${admissionNumber}`);
  };

  const handleAddStudent = () => {
    navigate("/addStudent");
  };

  const handleResetPayments = async () => {
    const password = prompt("Enter admin password to reset payments:");
    if (password !== "admin123") {
      alert("Incorrect password!");
      return;
    }

    const confirmReset = window.confirm("Are you sure you want to reset all payments to zero?");
    if (!confirmReset) {
      return;
    }

    const updatedStudents = {};
    for (const [admissionNumber, student] of Object.entries(students)) {
      updatedStudents[admissionNumber] = {
        ...student,
        tuitionPaid: 0,
        lunchPaid: 0,
        tracksuitPaid: 0,
        trouserPaid: 0,
        peShirtPaid: 0,
        payments: [],
      };
      await updateStudentFees(admissionNumber, updatedStudents[admissionNumber]);
    }
    alert("All payments have been reset to zero.");
    setStudents(updatedStudents);
  };

  const filteredStudents = Object.entries(students).filter(([key]) =>
    key.includes(search)
  );

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Search Admission Number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleAddStudent}>Add Student</button>
        <button className="reset-button" onClick={handleResetPayments}>Reset Payments</button>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Admission Number</th>
            <th>Name</th>
            <th>Tuition Balance</th>
            <th>Lunch Balance</th>
            <th>Tracksuit Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(([admissionNumber, student]) => {
            const gradeFees = GRADE_FEES[student.grade] || GRADE_FEES["1-3"];
            const tuitionBalance = student.tuitionPaid - gradeFees.tuition;
            const lunchBalance = student.lunchPaid - gradeFees.lunch;
            const tracksuitBalance = student.tracksuitPaid - gradeFees.tracksuit;

            const trouserBalance =
              student.trouserPaid ? student.trouserPaid - (gradeFees.tracksuit / 2) : 0;
            const peShirtBalance =
              student.peShirtPaid ? student.peShirtPaid - (gradeFees.tracksuit / 2) : 0;

            return (
              <tr key={admissionNumber}>
                <td>{admissionNumber}</td>
                <td>{student.name}</td>
                <td className={tuitionBalance < 0 ? "negative" : "positive"}>
                  {tuitionBalance}
                </td>
                <td className={lunchBalance < 0 ? "negative" : "positive"}>
                  {lunchBalance}
                </td>
                <td className={tracksuitBalance < 0 ? "negative" : "positive"}>
                  {tracksuitBalance}
                  <br />
                  <span className="sub-fees">
                    Trouser: {trouserBalance}, PE Shirt: {peShirtBalance}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleSelectStudent(admissionNumber)}>
                    Update Fees
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(admissionNumber)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;