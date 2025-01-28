import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addStudent } from "../services/FirebaseService";
import "./StudentAdmission.css";

const StudentAdmission = () => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1-3"); // Default grade selection
  const navigate = useNavigate();

  const handleAddStudent = async () => {
    if (!admissionNumber || !name) {
      alert("Please fill all fields!");
      return;
    }
    await addStudent(admissionNumber, name, grade);
    alert("Student added successfully!");
    navigate("/dashboard");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="student-admission">
      <h2>Add Student</h2>
      <input
        type="text"
        placeholder="Admission Number"
        value={admissionNumber}
        onChange={(e) => setAdmissionNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select value={grade} onChange={(e) => setGrade(e.target.value)}>
        <option value="1-3">Grade 1-3</option>
        <option value="4-6">Grade 4-6</option>
        <option value="7-9">Grade 7-9</option>
      </select>
      <div className="button-group">
        <button onClick={handleBack}>Back</button>
        <button onClick={handleAddStudent}>Add Student</button>
      </div>
    </div>
  );
};

export default StudentAdmission;