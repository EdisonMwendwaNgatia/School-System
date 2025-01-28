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
  const [lunchPaid, setLunchPaid] = useState(0);
  const [tracksuitPaid, setTracksuitPaid] = useState(0);
  const [trouserPaid, setTrouserPaid] = useState(0);
  const [peShirtPaid, setPeShirtPaid] = useState(0);
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
      setLunchPaid(studentData?.lunchPaid || 0);
      setTracksuitPaid(studentData?.tracksuitPaid || 0);
      setTrouserPaid(studentData?.trouserPaid || 0);
      setPeShirtPaid(studentData?.peShirtPaid || 0);
    };
    fetchStudent();
  }, [admissionNumber]);

  const handleSave = async () => {
    if (!mpesaCode || !network || !paymentAmount || !paymentDate) {
      alert("Please fill all payment details!");
      return;
    }

     // Create a new payment entry
  const payment = {
    mpesaCode,
    network,
    amount: paymentAmount,
    paymentDate,
  };

   // Add the new payment to the existing payments array
   const updatedPayments = [...(student.payments || []), payment];

   const updatedStudent = {
    tuitionPaid,
    lunchPaid,
    tracksuitPaid,
    trouserPaid,
    peShirtPaid,
    payments: updatedPayments, // Add the payments array to the updated object
  };

  await updateStudentFees(admissionNumber, updatedStudent);
    alert("Student fees updated!");
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
  
    // Create a new PDF document
    const doc = new jsPDF();
  
    // Title
    doc.setFontSize(16);
    doc.text(`Payment History for ${student.name}`, 20, 20);
  
    // Table data
    const tableColumns = ["CONFIRMATION CODE", "Network", "Amount", "Payment Date"];
    const tableRows = student.payments.map((payment) => [
      payment.mpesaCode,
      payment.network,
      payment.amount,
      payment.paymentDate,
    ]);
  
    // Add the table
    doc.autoTable({
      startY: 30,
      head: [tableColumns],
      body: tableRows,
    });
  
    // Save the PDF
    doc.save(`${student.name}_Payment_History.pdf`);
  };
  

  return (
    <div className="student-details">
      <div className="main-content">
        <h2>Update Fees for {student.name}</h2>

        <div className="fee-form-group">
          <div className="fee-input-container">
            <label>Tuition Paid: </label>
            <input
              type="number"
              value={tuitionPaid}
              onChange={(e) => setTuitionPaid(Number(e.target.value))}
            />
          </div>
          <div className="fee-input-container">
            <label>Lunch Paid: </label>
            <input
              type="number"
              value={lunchPaid}
              onChange={(e) => setLunchPaid(Number(e.target.value))}
            />
          </div>
          <div className="fee-input-container">
            <label>Tracksuit Paid (Total): </label>
            <input
              type="number"
              value={tracksuitPaid}
              onChange={(e) => setTracksuitPaid(Number(e.target.value))}
            />
          </div>
          <div className="fee-input-container">
            <label>Amount for Trouser: </label>
            <input
              type="number"
              value={trouserPaid}
              onChange={(e) => setTrouserPaid(Number(e.target.value))}
            />
          </div>
          <div className="fee-input-container">
            <label>Amount for PE Shirt: </label>
            <input
              type="number"
              value={peShirtPaid}
              onChange={(e) => setPeShirtPaid(Number(e.target.value))}
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
            Save All Transactions
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
            <h3>Payment History</h3>
            {["tuitionPaid", "lunchPaid", "tracksuitPaid", "trouserPaid", "peShirtPaid"].map(
              (feeType) => {
                const payments = student[feeType] || [];
                if (payments.length > 0) {
                  return (
                    <div key={feeType}>
                      <h4>{feeType.replace(/([A-Z])/g, " $1").trim()}</h4>
                      {payments.map((payment, index) => (
                        <p key={index}>
                          Payment {index + 1}: MPESA Code: {payment.mpesaCode},
                          Network: {payment.network}, Amount: {payment.amount},
                          Date: {payment.paymentDate}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }
            )}
            <button onClick={generatePDF}>Download PDF</button>
          </div>
        ) : (
          <div className="fee-summary">
            <h3>Fee Summary</h3>
            <p>Student Name: {student.name}</p>
            <p>Admission Number: {admissionNumber}</p>
            <p>Total Tuition Paid: {tuitionPaid}</p>
            <p>Total Lunch Paid: {lunchPaid}</p>
            <p>Total Tracksuit Paid: {tracksuitPaid}</p>
            <p>Total Trouser Paid: {trouserPaid}</p>
            <p>Total PE Shirt Paid: {peShirtPaid}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;