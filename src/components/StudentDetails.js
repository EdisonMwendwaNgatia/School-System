import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudents, updateStudentFees } from "../services/FirebaseService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./StudentDetails.css";

const StudentDetails = () => {
  const { admissionNumber } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({});
  const [tuitionPaid, setTuitionPaid] = useState(0);
  const [mpesaCode, setMpesaCode] = useState("");
  const [network, setNetwork] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [showStatement, setShowStatement] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      const students = await getStudents();
      const studentData = students[admissionNumber];
      setStudent(studentData);
      setTuitionPaid(studentData?.tuitionPaid || 0);
    };
    fetchStudent();
  }, [admissionNumber]);

  const handleSave = async () => {
    if (!mpesaCode || !network || !paymentAmount || !paymentDate) {
      alert("Please fill all payment details!");
      return;
    }

    const payment = {
      mpesaCode,
      network,
      amount: paymentAmount,
      paymentDate,
      feeType: "tuition" // Add fee type identifier
    };

    const updatedPayments = [...(student.payments || []), payment];
    
    const updatedStudent = {
      tuitionPaid: (student.tuitionPaid || 0) + paymentAmount, // Fix duplication issue
      payments: updatedPayments,
    };

    await updateStudentFees(admissionNumber, updatedStudent);
    alert("Tuition fees updated!");
    navigate("/dashboard");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const generatePDF = () => {
    if (!student.payments || student.payments.length === 0) {
      alert("No payment history available to download.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Tuition Payment History for ${student.name}`, 20, 20);

    const tableColumns = ["CONFIRMATION CODE", "Network", "Amount", "Payment Date"];
    const tableRows = student.payments
      .filter(p => p.feeType === "tuition")
      .map((payment) => [
        payment.mpesaCode,
        payment.network,
        payment.amount,
        payment.paymentDate,
      ]);

    doc.autoTable({
      startY: 30,
      head: [tableColumns],
      body: tableRows,
    });

    doc.save(`${student.name}_Tuition_Payments.pdf`);
  };

  return (
    <div className="student-details">
      <div className="main-content">
        <h2>Update Tuition Fees for {student.name}</h2>

        <div className="fee-form-group">
          <div className="fee-input-container">
            <label>Total Tuition Paid: </label>
            <input
              type="number"
              value={tuitionPaid}
              onChange={(e) => setTuitionPaid(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="fee-payment-form">
          <h3>Enter Payment Details</h3>
          <input
            type="text"
            placeholder="MPESA Code"
            value={mpesaCode}
            onChange={(e) => setMpesaCode(e.target.value)}
          />
          <input
            type="text"
            placeholder="Network (e.g. Safaricom)"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount Paid"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
          />
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>

        <div className="button-group">
          <button className="back-button" onClick={handleBack}>
            Back
          </button>
          <button className="save-button" onClick={handleSave}>
            Save Tuition Payment
          </button>
          <button
            className="statement-button"
            onClick={() => setShowStatement(!showStatement)}
          >
            Fee Statement
          </button>
        </div>
      </div>

      <div className="side-panel">
        {showStatement ? (
          <div className="fee-statement">
            <h3>Tuition Payment History</h3>
            {student.payments?.filter(p => p.feeType === "tuition").map((payment, index) => (
              <div key={index}>
                <p>
                  Payment {index + 1}: MPESA Code: {payment.mpesaCode},
                  Network: {payment.network}, Amount: {payment.amount},
                  Date: {payment.paymentDate}
                </p>
              </div>
            ))}
            <button onClick={generatePDF}>Download PDF</button>
          </div>
        ) : (
          <div className="fee-summary">
            <h3>Tuition Summary</h3>
            <p>Student Name: {student.name}</p>
            <p>UPI Number: {admissionNumber}</p>
            <p>Total Tuition Paid: {tuitionPaid}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;