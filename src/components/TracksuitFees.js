import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudents, updateStudentFees } from "../services/FirebaseService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./TracksuitFees.css";

const TracksuitFees = () => {
  const { admissionNumber } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({});
  const [trouserPaid, setTrouserPaid] = useState(0);
  const [shirtPaid, setShirtPaid] = useState(0);
  const [mpesaCode, setMpesaCode] = useState("");
  const [network, setNetwork] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentType, setPaymentType] = useState("both");

  useEffect(() => {
    const fetchStudent = async () => {
      const students = await getStudents();
      const studentData = students[admissionNumber] || {};
      setStudent(studentData);
      setTrouserPaid(studentData.trouserPaid || 0);
      setShirtPaid(studentData.peShirtPaid || 0);
    };
    fetchStudent();
  }, [admissionNumber]);

  const calculatePaymentAmount = () => {
    if (paymentType === "trouser") {
      return trouserPaid;
    } else if (paymentType === "shirt") {
      return shirtPaid;
    } else if (paymentType === "both") {
      return trouserPaid + shirtPaid;
    }
    return 0;
  };

  const handleSave = async () => {
    const paymentAmount = calculatePaymentAmount();
    if (!mpesaCode || !network || !paymentAmount || !paymentDate) {
      alert("Please fill all payment details!");
      return;
    }

    const payment = {
      mpesaCode,
      network,
      amount: paymentAmount,
      paymentDate,
      feeType: "tracksuit",
      paymentType,
    };

    const updatedPayments = [...(student.payments || []), payment];

    let updatedTrouserPaid = student.trouserPaid || 0;
    let updatedShirtPaid = student.peShirtPaid || 0;

    if (paymentType === "trouser") {
      updatedTrouserPaid += trouserPaid;
    } else if (paymentType === "shirt") {
      updatedShirtPaid += shirtPaid;
    } else if (paymentType === "both") {
      updatedTrouserPaid += trouserPaid;
      updatedShirtPaid += shirtPaid;
    }

    const updatedStudent = {
      ...student,
      trouserPaid: updatedTrouserPaid,
      peShirtPaid: updatedShirtPaid,
      payments: updatedPayments,
    };

    await updateStudentFees(admissionNumber, updatedStudent);
    alert("Tracksuit payment saved!");
    navigate("/dashboard");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Payment Record for ${student.name}`, 10, 10);
    doc.autoTable({
      startY: 20,
      head: [["MPESA Code", "Network", "Amount", "Payment Date", "Payment Type"]],
      body: student.payments.map((p) => [
        p.mpesaCode,
        p.network,
        p.amount,
        p.paymentDate,
        p.paymentType,
      ]),
    });
    doc.save(`Payment_Record_${student.name}.pdf`);
  };

  return (
    <div className="tracksuit-fees">
      <div className="main-content">
        <h2>Manage Tracksuit Fees for {student.name}</h2>

        <div className="fee-form-group">
          <div className="fee-input-container">
            <label>Trouser Paid: </label>
            <input
              type="number"
              value={trouserPaid}
              onChange={(e) => setTrouserPaid(Number(e.target.value))}
            />
          </div>
          <div className="fee-input-container">
            <label>PE Shirt Paid: </label>
            <input
              type="number"
              value={shirtPaid}
              onChange={(e) => setShirtPaid(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="payment-form">
          <h3>Record Payment</h3>
          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
            <option value="both">Both Items</option>
            <option value="trouser">Trouser Only</option>
            <option value="shirt">PE Shirt Only</option>
          </select>
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
            Save Payment
          </button>
          <button className="pdf-button" onClick={generatePDF}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default TracksuitFees;