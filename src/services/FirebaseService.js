import { ref, set, remove, get, update } from "firebase/database";
import { db } from "../firebase";

// Add a new student
export const addStudent = (admissionNumber, name, grade, term) => {
  const studentRef = ref(db, "students/" + admissionNumber);
  const fees = getFeesForGradeAndTerm(grade, term);
  return set(studentRef, {
    name: name,
    grade: grade,
    term: term,
    tuitionPaid: 0,
    tuitionBalance: fees.tuition,
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

// Helper function to get fees for a specific grade and term
const getFeesForGradeAndTerm = (grade, term) => {
  const TERM_FEES = {
    TERM_1: {
      "1-3": { tuition: 12500, lunch: 2000, tracksuit: 1000 },
      "4-6": { tuition: 15500, lunch: 2000, tracksuit: 1000 },
      "7-9": { tuition: 19500, lunch: 2000, tracksuit: 1000 },
    },
    TERM_2: {
      "1-3": { tuition: 11500, lunch: 2000, tracksuit: 1000 },
      "4-6": { tuition: 14500, lunch: 2000, tracksuit: 1000 },
      "7-9": { tuition: 18500, lunch: 2000, tracksuit: 1000 },
    },
    TERM_3: {
      "1-3": { tuition: 11500, lunch: 2000, tracksuit: 1000 },
      "4-6": { tuition: 14500, lunch: 2000, tracksuit: 1000 },
      "7-9": { tuition: 18500, lunch: 2000, tracksuit: 1000 },
    },
  };

  return TERM_FEES[term][grade] || TERM_FEES[term]["1-3"];
};
