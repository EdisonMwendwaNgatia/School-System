import { ref, set, remove, get, update } from "firebase/database";
import { db } from "../firebase";

// Add a new student
export const addStudent = (admissionNumber, name, grade) => {
  const studentRef = ref(db, "students/" + admissionNumber);
  return set(studentRef, {
    name: name,
    grade: grade,
    tuitionPaid: 0,
    lunchPaid: 0,
    tracksuitPaid: 0,
    trouserPaid: 0,
    peShirtPaid: 0,
  });
};

// Get all students
export const getStudents = async () => {
  const studentRef = ref(db, "students");
  const snapshot = await get(studentRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// Get a single student's data by admission number
export const getStudent = async (admissionNumber) => {
  const studentRef = ref(db, "students/" + admissionNumber);
  const snapshot = await get(studentRef);
  return snapshot.exists() ? snapshot.val() : null;
};

// Update student fees
export const updateStudentFees = (admissionNumber, fees) => {
  const studentRef = ref(db, "students/" + admissionNumber);
  return update(studentRef, fees);
};

// Delete a student by admission number
export const deleteStudent = (admissionNumber) => {
  const studentRef = ref(db, "students/" + admissionNumber);
  return remove(studentRef);
};
