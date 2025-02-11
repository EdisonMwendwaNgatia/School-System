import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudents, updateStudentFees } from "../services/FirebaseService";
import "./LunchFees.css";

const LUNCH_FEE_PER_DAY = 100;

const LunchFees = () => {
  const { admissionNumber } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({});
  const [mpesaCode, setMpesaCode] = useState("");
  const [network, setNetwork] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [unpaidDays, setUnpaidDays] = useState([]);
  const [paymentPlan, setPaymentPlan] = useState("daily");
  const termDays = 90; // Total school days in term

  useEffect(() => {
    const fetchStudent = async () => {
      const students = await getStudents();
      const studentData = students[admissionNumber];
      setStudent(studentData);
      setUnpaidDays(studentData?.unpaidDays || Array.from({ length: termDays }, (_, i) => i + 1));
    };
    fetchStudent();
  }, [admissionNumber, termDays]);

  // Calculate derived values
  const totalLunchPaid = (termDays - unpaidDays.length) * LUNCH_FEE_PER_DAY;
  const paymentAmount = totalLunchPaid - (student.lunchPaid || 0);

  const handleSave = async () => {
    if (!mpesaCode || !network || !paymentDate) {
      alert("Please fill all payment details!");
      return;
    }

    if (paymentAmount <= 0) {
      alert("No payment to save. Check some days to make a payment.");
      return;
    }

    const payment = {
      mpesaCode,
      network,
      amount: paymentAmount,
      paymentDate,
      feeType: "lunch",
      paymentPlan,
      daysCovered: paymentAmount / LUNCH_FEE_PER_DAY,
    };

    const updatedStudent = {
      lunchPaid: totalLunchPaid,
      unpaidDays: unpaidDays,
      payments: [...(student.payments || []), payment],
    };

    await updateStudentFees(admissionNumber, updatedStudent);
    alert("Lunch fees updated!");
    navigate("/dashboard");
  };

  const handleDayCheckboxChange = (day) => {
    setUnpaidDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const renderDaysGrid = () => {
    const weeks = [];
    for (let i = 0; i < termDays; i += 7) {
      const weekDays = Array.from({ length: 7 }, (_, j) => i + j + 1)
                         .filter(day => day <= termDays);
      weeks.push(weekDays);
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="week">
        <h4>Week {weekIndex + 1}</h4>
        <div className="days-grid">
          {week.map(day => (
            <label key={day}>
              <input
                type="checkbox"
                checked={!unpaidDays.includes(day)}
                onChange={() => handleDayCheckboxChange(day)}
              />
              Day {day}
            </label>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="lunch-fees">
      <div className="main-content">
        <h2>Manage Lunch Fees for {student.name}</h2>

        <div className="fee-form-group">
          <div className="fee-input-container">
            <label>Total Lunch Paid: </label>
            <input 
              type="number" 
              value={totalLunchPaid} 
              readOnly 
            />
          </div>
        </div>

        <div className="payment-plan">
          <h3>Select Payment Plan</h3>
          <select value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value)}>
            <option value="daily">Daily (Ksh 100 per day)</option>
            <option value="weekly">Weekly (Ksh 500 per week)</option>
            <option value="monthly">Monthly (Ksh 2000 per month)</option>
            <option value="full-term">Full Term (Depends on school days)</option>
          </select>
        </div>

        <div className="unpaid-days">
          <h3>Mark Paid Days</h3>
          {renderDaysGrid()}
        </div>

        <div className="payment-form">
          <h3>Payment Details</h3>
          <input 
            type="text" 
            placeholder="MPESA Code" 
            value={mpesaCode} 
            onChange={(e) => setMpesaCode(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Network" 
            value={network} 
            onChange={(e) => setNetwork(e.target.value)} 
          />
          <input
            type="number"
            placeholder="Amount"
            value={paymentAmount}
            readOnly
          />
          <input 
            type="date" 
            value={paymentDate} 
            onChange={(e) => setPaymentDate(e.target.value)} 
          />
        </div>

        <div className="button-group">
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            Back
          </button>
          <button className="save-button" onClick={handleSave}>
            Save Lunch Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default LunchFees;