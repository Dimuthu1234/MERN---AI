/**
 * ═══════════════════════════════════════════════════════════════
 *  Session 2 — Objects & Destructuring
 *  Objects, Destructuring, Spread/Rest, Object Methods
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// 1. Creating Objects (Object එකක් හදමු)
// ─────────────────────────────────────────────────────────────

/** Object එකක් = key-value pairs එකතුවක් */
const student = {
  name: "Kasun Perera",
  age: 22,
  course: "MERN Full Stack",
  marks: { html: 85, css: 78, js: 92 },
  hobbies: ["coding", "gaming", "cricket"],
};

console.log("--- Object එක ---");
console.log(student);

// ─────────────────────────────────────────────────────────────
// 2. Accessing Properties (Properties access කරන ක්‍රම දෙක)
// ─────────────────────────────────────────────────────────────

/** Dot notation — සාමාන්‍ය ක්‍රමය */
console.log("\n--- Dot Notation ---");
console.log(student.name);
console.log(student.marks.js);

/** Bracket notation — dynamic keys වලට useful */
console.log("\n--- Bracket Notation ---");
const key = "course";
console.log(student[key]);

// ─────────────────────────────────────────────────────────────
// 3. Object Destructuring (Object එකෙන් values ගන්න shortcut)
// ─────────────────────────────────────────────────────────────

/** Basic destructuring */
console.log("\n--- Basic Destructuring ---");
const { name, age, course } = student;
console.log(name, age, course);

/** Rename කරමින් destructure කරමු */
console.log("\n--- Rename while Destructuring ---");
const { name: studentName, age: studentAge } = student;
console.log(studentName, studentAge);

/** Default values — නැති property එකකට default එකක් දෙමු */
console.log("\n--- Default Values ---");
const { email = "not provided", course: c } = student;
console.log("Email:", email);

/** Nested destructuring — object ඇතුලේ object */
console.log("\n--- Nested Destructuring ---");
const {
  marks: { html, js },
} = student;
console.log("HTML:", html, "JS:", js);

// ─────────────────────────────────────────────────────────────
// 4. Array Destructuring (Array එකෙන් values ගන්න shortcut)
// ─────────────────────────────────────────────────────────────

console.log("\n--- Array Destructuring ---");
const colors = ["red", "green", "blue", "yellow"];

const [first, second] = colors;
console.log("First:", first, "Second:", second);

/** Skip කරමු — comma එකෙන් skip වෙනවා */
const [, , third] = colors;
console.log("Third:", third);

// ─────────────────────────────────────────────────────────────
// 5. Spread Operator (...) — පැතිරීම!
// ─────────────────────────────────────────────────────────────

/** Array spread — copy + combine */
console.log("\n--- Spread: Arrays ---");
const fruits = ["apple", "banana"];
const moreFruits = [...fruits, "mango", "orange"];
console.log(moreFruits);

/** Object spread — copy + merge */
console.log("\n--- Spread: Objects ---");
const updatedStudent = { ...student, age: 23, email: "kasun@gmail.com" };
console.log(updatedStudent);

// ─────────────────────────────────────────────────────────────
// 6. Rest Parameters (...) — ඉතිරි ටික එකතු කරගන්න
// ─────────────────────────────────────────────────────────────

console.log("\n--- Rest Parameters ---");
const { name: n, ...rest } = student;
console.log("Name:", n);
console.log("Rest:", rest);

const [head, ...tail] = colors;
console.log("Head:", head);
console.log("Tail:", tail);

// ─────────────────────────────────────────────────────────────
// 7. Object Methods (Object.keys, values, entries)
// ─────────────────────────────────────────────────────────────

console.log("\n--- Object.keys ---");
console.log(Object.keys(student));

console.log("\n--- Object.values ---");
console.log(Object.values(student.marks));

console.log("\n--- Object.entries ---");
Object.entries(student.marks).forEach(([subject, mark]) => {
  console.log(`${subject}: ${mark}`);
});

// ─────────────────────────────────────────────────────────────
// 8. Real-World Example — සියල්ල එකට!
// ─────────────────────────────────────────────────────────────

console.log("\n--- 🎯 Real-World: Course Enrollment Summary ---");

const batch = {
  batchName: "Batch 5",
  startDate: "2026-04-15",
  students: [
    { name: "Kasun", paid: true, marks: { js: 90 } },
    { name: "Nimali", paid: false, marks: { js: 85 } },
    { name: "Ruwan", paid: true, marks: { js: 72 } },
  ],
};

const { batchName, students } = batch;

/** Paid students filter කරමු, names ගන්නවා, average marks ගනනවා */
const paidStudents = students.filter((s) => s.paid);
const paidNames = paidStudents.map((s) => s.name);
const avgMark =
  students.reduce((sum, s) => sum + s.marks.js, 0) / students.length;

console.log(`Batch: ${batchName}`);
console.log(`Paid students: ${paidNames.join(", ")}`);
console.log(`Average JS mark: ${avgMark.toFixed(1)}`);
