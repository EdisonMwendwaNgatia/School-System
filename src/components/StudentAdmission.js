import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addStudent } from "../services/FirebaseService";
import "./StudentAdmission.css";

const StudentAdmission = () => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1-3");
  const [term, setTerm] = useState("TERM_1");
  const navigate = useNavigate();

  const handleAddStudent = async () => {
    if (!admissionNumber || !name) {
      alert("Please fill all fields!");
      return;
    }

    await addStudent(admissionNumber, name, grade, term);
    alert("Student added successfully!");
    navigate("/dashboard");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="student-admission">
      <h2>Add Student</h2>
      <div className="form-group">
        <label>UPI Number</label>
        <input
          type="text"
          value={admissionNumber}
          onChange={(e) => setAdmissionNumber(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Grade Level</label>
        <div className="select-wrapper">
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="1-3">Grade 1-3</option>
            <option value="4-6">Grade 4-6</option>
            <option value="7-9">Grade 7-9</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Term</label>
        <div className="select-wrapper">
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="TERM_1">Term 1</option>
            <option value="TERM_2">Term 2</option>
            <option value="TERM_3">Term 3</option>
          </select>
        </div>
      </div>
      <div className="button-group">
        <button onClick={handleBack}>Back</button>
        <button onClick={handleAddStudent}>Add Student</button>
      </div>
    </div>
  );
};

export default StudentAdmission;
