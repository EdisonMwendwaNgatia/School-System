import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, deleteStudent, updateStudentFees } from "../services/FirebaseService";
import "./Dashboard.css";

const TERM_FEES = {
  TERM_1: {
    "1-3": {
      tuition: 12500,
      lunch: 2000,
      tracksuit: 1000,
    },
    "4-6": {
      tuition: 15500,
      lunch: 2000,
      tracksuit: 1000,
    },
    "7-9": {
      tuition: 19500,
      lunch: 2000,
      tracksuit: 1000,
    },
  },
  TERM_2: {
    "1-3": {
      tuition: 11500,
      lunch: 2000,
      tracksuit: 1000,
    },
    "4-6": {
      tuition: 14500,
      lunch: 2000,
      tracksuit: 1000,
    },
    "7-9": {
      tuition: 18500,
      lunch: 2000,
      tracksuit: 1000,
    },
  },
  TERM_3: {
    "1-3": {
      tuition: 11500,
      lunch: 2000,
      tracksuit: 1000,
    },
    "4-6": {
      tuition: 14500,
      lunch: 2000,
      tracksuit: 1000,
    },
    "7-9": {
      tuition: 18500,
      lunch: 2000,
      tracksuit: 1000,
    },
  },
};

const Dashboard = () => {
  const [students, setStudents] = useState({});
  const [search, setSearch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("TERM_1");
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
    if (password !== "Shalu1991") {
      alert("Incorrect password!");
      return;
    }

    const term = prompt("Enter the term (TERM_1, TERM_2, TERM_3):");
    if (!TERM_FEES[term]) {
      alert("Invalid term!");
      return;
    }

    setSelectedTerm(term);

    const confirmReset = window.confirm("Are you sure you want to reset all payments to zero?");
    if (!confirmReset) {
      return;
    }

    const updatedStudents = {};
    for (const [admissionNumber, student] of Object.entries(students)) {
      updatedStudents[admissionNumber] = {
        ...student,
        tuitionPaid: 0, // Reset tuition payments
        lunchPaid: 0,   // Reset lunch payments
        payments: [],   // Clear payment history
        // Do not reset trouserPaid and peShirtPaid
      };
      await updateStudentFees(admissionNumber, updatedStudents[admissionNumber]);
    }
    alert("All payments (except tracksuit payments) have been reset to zero.");
    setStudents(updatedStudents);
  };

  const handleNavigateToLunchFees = () => {
    navigate("/lunchFees");
  };

  const handleNavigateToTracksuitFees = () => {
    navigate("/tracksuitFees");
  };

  const filteredStudents = Object.entries(students).filter(([_, student]) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  const GRADE_FEES = TERM_FEES[selectedTerm];

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleAddStudent}>Add Student</button>
        <button className="reset-button" onClick={handleResetPayments}>Reset Payments</button>
        <button className="lunch-button" onClick={handleNavigateToLunchFees}>Lunch Fees</button>
        <button className="tracksuit-button" onClick={handleNavigateToTracksuitFees}>Tracksuit Fees</button>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>UPI Number</th>
            <th>Name</th>
            <th>Paid Tuition</th>
            <th>Tuition Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(([admissionNumber, student]) => {
            const gradeFees = GRADE_FEES[student.grade] || GRADE_FEES["1-3"];
            const tuitionBalance = gradeFees.tuition - (student.tuitionPaid || 0);

            return (
              <tr key={admissionNumber}>
                <td>{admissionNumber}</td>
                <td>{student.name}</td>
                <td>{student.tuitionPaid || 0}</td>
                <td className={tuitionBalance < 0 ? "negative" : "positive"}>
                  {tuitionBalance}
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