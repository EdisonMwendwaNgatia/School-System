import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../services/FirebaseService";
import "./TracksuitFeesDashboard.css";

const TRACKSUIT_COST = {
  trouser: 1000,
  peShirt: 500,
};

const TracksuitFeesDashboard = () => {
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
    <div className="tracksuit-fees-dashboard">
      <h2>Tracksuit Fees Management</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>UPI Number</th>
            <th>Name</th>
            <th>Trouser Paid</th>
            <th>PE Shirt Paid</th>
            <th>Trouser Balance</th>
            <th>Shirt Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(([admissionNumber, student]) => {
            const trouserBalance = Math.max(0, TRACKSUIT_COST.trouser - student.trouserPaid);
            const shirtBalance = Math.max(0, TRACKSUIT_COST.peShirt - student.peShirtPaid);

            return (
              <tr key={admissionNumber}>
                <td>{admissionNumber}</td>
                <td>{student.name}</td>
                <td className="positive">{student.trouserPaid}</td>
                <td className="positive">{student.peShirtPaid}</td>
                <td className="negative">{trouserBalance}</td>
                <td className="negative">{shirtBalance}</td>
                <td>
                  <button onClick={() => navigate(`/tracksuitFees/${admissionNumber}`)}>
                    Update Tracksuit Fees
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

export default TracksuitFeesDashboard;
