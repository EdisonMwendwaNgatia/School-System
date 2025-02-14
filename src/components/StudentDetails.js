import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudents, updateStudentFees } from "../services/FirebaseService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./StudentDetails.css";

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
  const [selectedTerm] = useState("TERM_1");

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
      feeType: "tuition",
    };

    const updatedPayments = [...(student.payments || []), payment];
    const updatedStudent = {
      tuitionPaid: (student.tuitionPaid || 0) + paymentAmount,
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
    
    // Header
    doc.setFillColor(52, 73, 94);
    doc.rect(0, 0, 220, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("School Fee Statement", 105, 20, { align: "center" });
    
    // Reset text color for body
    doc.setTextColor(0, 0, 0);
    
    // Student Information Section
    doc.setFontSize(12);
    doc.text("Student Information", 20, 50);
    doc.setDrawColor(52, 73, 94);
    doc.line(20, 52, 190, 52);
    
    doc.setFontSize(10);
    doc.text(`Name: ${student.name}`, 20, 60);
    doc.text(`UPI Number: ${admissionNumber}`, 20, 67);
    doc.text(`Grade: ${student.grade}`, 120, 60);
    doc.text(`Term: ${selectedTerm.replace("_", " ")}`, 120, 67);
    
    // Fee Summary Section
    const gradeFees = TERM_FEES[selectedTerm]?.[student.grade] || TERM_FEES[selectedTerm]["1-3"];
    const tuitionBalance = gradeFees.tuition - (student.tuitionPaid || 0);
    
    doc.setFontSize(12);
    doc.text("Fee Summary", 20, 85);
    doc.line(20, 87, 190, 87);
    
    doc.setFontSize(10);
    doc.text("Description", 20, 95);
    doc.text("Amount (KES)", 160, 95);
    
    doc.text("Term Fees:", 20, 105);
    doc.text(gradeFees.tuition.toLocaleString(), 160, 105, { align: "right" });
    
    doc.text("Total Paid:", 20, 115);
    doc.text((student.tuitionPaid || 0).toLocaleString(), 160, 115, { align: "right" });
    
    doc.text("Balance:", 20, 125);
    doc.setTextColor(tuitionBalance > 0 ? 255 : 0, tuitionBalance > 0 ? 0 : 255, 0);
    doc.text(tuitionBalance.toLocaleString(), 160, 125, { align: "right" });
    
    // Payment History Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Payment History", 20, 145);
    doc.line(20, 147, 190, 147);
    
    const tableColumns = [
      ["Date", "Confirmation Code/Payment Type", "Network/Payment Firm", "Amount (KES)"]
    ];
    
    const tableRows = student.payments
      .filter(p => p.feeType === "tuition")
      .map(payment => [
        payment.paymentDate,
        payment.mpesaCode,
        payment.network,
        payment.amount.toLocaleString()
      ]);
    
    doc.autoTable({
      startY: 155,
      head: tableColumns,
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40, halign: 'right' }
      }
    });
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      105,
      pageHeight - 10,
      { align: "center" }
    );
    
    doc.save(`${student.name}_Fee_Statement.pdf`);
  };

  return (
    <div className="student-details">
      <div className="main-content">
        <h2>Update Tuition Fees for {student.name}</h2>

        <div className="fee-form-group">
          <label>Total Tuition Paid: </label>
          <input type="number" value={tuitionPaid} readOnly />
        </div>

        <div className="fee-payment-form">
          <h3>Enter Payment Details</h3>
          <input type="text" placeholder="MPESA Code" value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value)} />
          <input type="text" placeholder="Network (e.g. Safaricom)" value={network} onChange={(e) => setNetwork(e.target.value)} />
          <input type="number" placeholder="Amount Paid" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} />
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </div>

        <div className="button-group">
          <button className="back-button" onClick={handleBack}>Back</button>
          <button className="save-button" onClick={handleSave}>Save Tuition Payment</button>
          <button className="statement-button" onClick={() => setShowStatement(!showStatement)}>Fee Statement</button>
        </div>
      </div>

      <div className="side-panel">
        {showStatement ? (
          <div className="fee-statement">
            <h3>Tuition Payment History</h3>
            {student.payments?.filter((p) => p.feeType === "tuition").map((payment, index) => (
              <div key={index}>
                <p>Payment {index + 1}: MPESA Code: {payment.mpesaCode}, Network: {payment.network}, Amount: {payment.amount}, Date: {payment.paymentDate}</p>
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
