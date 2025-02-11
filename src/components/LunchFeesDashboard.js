import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../services/FirebaseService";
import "./LunchFeesDashboard.css";

const termDays = 90; // Number of school days in a term
const dailyRate = 100; // Lunch fee per day

const LunchFeesDashboard = () => {
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

  const filteredStudents = Object.entries(students).filter(([_, student]) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lunch-fees-dashboard">
      <h2>Lunch Fees Management</h2>
      <div className="controls">
        <input type="text" placeholder="Search by Name" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>UPI Number</th>
            <th>Name</th>
            <th>Paid Days</th>
            <th>Unpaid Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(([admissionNumber, student]) => {
            const totalFee = termDays * dailyRate;
            const paidDays = Math.floor(student.lunchPaid / dailyRate);
            const unpaidDays = termDays - paidDays;

            return (
              <tr key={admissionNumber}>
                <td>{admissionNumber}</td>
                <td>{student.name}</td>
                <td>{paidDays}</td>
                <td>{unpaidDays}</td>
                <td>
                  <button onClick={() => navigate(`/lunchFees/${admissionNumber}`)}>Update Lunch Fees</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LunchFeesDashboard;