import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, deleteStudent, updateStudentFees } from "../services/FirebaseService";
import jsPDF from "jspdf";
import "./Dashboard.css";


const TERM_FEES = {
  TERM_1: {
    "1-3": { tuition: 12500 },
    "4-6": { tuition: 15500 },
    "7-9": { tuition: 19500 },
  },
  TERM_2: {
    "1-3": { tuition: 11500 },
    "4-6": { tuition: 14500 },
    "7-9": { tuition: 18500 },
  },
  TERM_3: {
    "1-3": { tuition: 11500 },
    "4-6": { tuition: 14500 },
    "7-9": { tuition: 18500 },
  },
};

const Dashboard = () => {
  const [students, setStudents] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudents();
      console.log("Fetched students:", data); // Log the fetched students data
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

    const confirmReset = window.confirm("Are you sure you want to reset all payments to zero and carry forward balances?");
    if (!confirmReset) {
      return;
    }

    const updatedStudents = {};
    for (const [admissionNumber, student] of Object.entries(students)) {
      const gradeFees = TERM_FEES[term][student.grade];
      const newBalance = (gradeFees ? gradeFees.tuition : 0) + (student.tuitionBalance || 0) - (student.tuitionPaid || 0);

      updatedStudents[admissionNumber] = {
        ...student,
        term: term,
        tuitionPaid: 0, // Reset tuition payments
        tuitionBalance: newBalance,
        //payments: [],   // Clear payment history
      };
      await updateStudentFees(admissionNumber, updatedStudents[admissionNumber]);
    }

    alert("All payments have been reset to zero, and balances have been carried forward to the selected term.");

    // Fetch the updated student data from the database
    const refreshedStudents = await getStudents();
    console.log("Refreshed students:", refreshedStudents); // Log the refreshed students data
    setStudents(refreshedStudents);
  };

  const generateAllStudentsPDF = () => {
    const doc = new jsPDF();
    let startY = 10;
  
    Object.entries(students).forEach(([admissionNumber, student], index) => {
      if (index > 0) {
        doc.addPage();
      }
  
      doc.setFontSize(12);
      doc.text(`Name: ${student.name}`, 10, startY);
      doc.text(`UPI Number: ${admissionNumber}`, 10, startY + 7);
      doc.text(`Grade: ${student.grade}`, 10, startY + 14);
      doc.text(`Term: ${student.term.replace("_", " ")}`, 10, startY + 21);
  
      const gradeFees = TERM_FEES[student.term]?.[student.grade] || TERM_FEES[student.term]["1-3"];
      const tuitionBalance = gradeFees.tuition - (student.tuitionPaid || 0);
  
      doc.text("Fee Summary", 10, startY + 35);
      doc.text(`Term Fees: ${gradeFees.tuition.toLocaleString()}`, 10, startY + 42);
      doc.text(`Total Paid: ${(student.tuitionPaid || 0).toLocaleString()}`, 10, startY + 49);
      doc.text(`Balance: ${tuitionBalance.toLocaleString()}`, 10, startY + 56);
  
      doc.text("Payment History", 10, startY + 70);
      const payments = student.payments?.filter(p => p.feeType === "tuition") || [];
      payments.forEach((payment, i) => {
        doc.text(
          `${payment.paymentDate} - ${payment.mpesaCode} - ${payment.network} - ${payment.amount.toLocaleString()}`,
          10,
          startY + 77 + i * 7
        );
      });
    });
  
    doc.save("All_Students_Fee_Statements.pdf");
  };
  

  const filteredStudents = Object.entries(students).filter(([_, student]) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

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
        <button className="pdf-button" onClick={generateAllStudentsPDF}>Download All Students PDF</button>
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
            console.log("Student data:", student); // Log each student's data
            const gradeFees = TERM_FEES[student.term]?.[student.grade];
            const tuitionBalance = gradeFees ? gradeFees.tuition - (student.tuitionPaid || 0) : 'Invalid grade or term';

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
