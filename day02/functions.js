/**
 * ═══════════════════════════════════════════════════════════════
 *  Session 2 — Functions Deep Dive
 *  Declarations, Arrows, Callbacks, Higher-Order Functions
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// 1. Function Declaration vs Expression
// ─────────────────────────────────────────────────────────────

/** Function Declaration — hoisted වෙනවා (ඉහළට යයි) */
console.log("--- Function Declaration ---");
console.log(greet("Kasun"));

function greet(name) {
  return `Hello, ${name}!`;
}

/** Function Expression — variable එකකට assign කරනවා */
console.log("\n--- Function Expression ---");
const add = function (a, b) {
  return a + b;
};
console.log("5 + 3 =", add(5, 3));

// ─────────────────────────────────────────────────────────────
// 2. Arrow Functions (=>) — කෙටි ක්‍රමය
// ─────────────────────────────────────────────────────────────

console.log("\n--- Arrow Functions ---");

/** Multi-line arrow function */
const multiply = (a, b) => {
  const result = a * b;
  return result;
};

/** One-liner — return keyword අවශ්‍ය නැහැ */
const square = (x) => x * x;

/** Single param — parentheses අවශ්‍ය නැහැ */
const double = (x) => x * 2;

console.log("3 × 4 =", multiply(3, 4));
console.log("5² =", square(5));
console.log("7 × 2 =", double(7));

// ─────────────────────────────────────────────────────────────
// 3. Default Parameters (Default අගයන්)
// ─────────────────────────────────────────────────────────────

console.log("\n--- Default Parameters ---");

const createStudent = (name, course = "MERN Full Stack", batch = 5) => {
  return { name, course, batch };
};

console.log(createStudent("Nimali"));
console.log(createStudent("Ruwan", "UI/UX Design", 3));

// ─────────────────────────────────────────────────────────────
// 4. Callback Functions (Function එකක් argument එකක් ලෙස pass කිරීම)
// ─────────────────────────────────────────────────────────────

console.log("\n--- Callback Functions ---");

/** processStudent function එකට callback එකක් pass කරනවා */
const processStudent = (name, callback) => {
  console.log(`Processing: ${name}`);
  callback(name);
};

processStudent("Kasun", (name) => {
  console.log(`✅ ${name} enrolled successfully!`);
});

processStudent("Nimali", (name) => {
  console.log(`📧 Welcome email sent to ${name}`);
});

// ─────────────────────────────────────────────────────────────
// 5. Higher-Order Functions — map, filter, reduce
// ─────────────────────────────────────────────────────────────

const students = [
  { name: "Kasun", marks: 92, paid: true },
  { name: "Nimali", marks: 78, paid: true },
  { name: "Ruwan", marks: 45, paid: false },
  { name: "Dilini", marks: 88, paid: true },
  { name: "Amal", marks: 34, paid: false },
];

/** map() — හැම element එකක්ම transform කරනවා */
console.log("\n--- map() ---");
const names = students.map((s) => s.name);
console.log("Names:", names);

const results = students.map((s) => ({
  name: s.name,
  grade: s.marks >= 80 ? "A" : s.marks >= 60 ? "B" : s.marks >= 40 ? "C" : "F",
}));
console.log("Grades:", results);

/** filter() — condition එකට match වෙන ඒවා විතරක් ගන්නවා */
console.log("\n--- filter() ---");
const passed = students.filter((s) => s.marks >= 40);
console.log("Passed:", passed.map((s) => s.name));

const paidAndPassed = students.filter((s) => s.paid && s.marks >= 60);
console.log("Paid & Passed:", paidAndPassed.map((s) => s.name));

/** reduce() — සියල්ල එක value එකකට compress කරනවා */
console.log("\n--- reduce() ---");
const totalMarks = students.reduce((sum, s) => sum + s.marks, 0);
console.log("Total marks:", totalMarks);
console.log("Average:", (totalMarks / students.length).toFixed(1));

/** Highest scorer — reduce වලින් හොයමු */
const topStudent = students.reduce((top, s) => (s.marks > top.marks ? s : top));
console.log("Top student:", topStudent.name, topStudent.marks);

// ─────────────────────────────────────────────────────────────
// 6. forEach vs map vs filter vs reduce — Comparison
// ─────────────────────────────────────────────────────────────

console.log("\n--- Comparison ---");

/** forEach — just loop, returns nothing (undefined) */
console.log("forEach:");
students.forEach((s) => console.log(`  ${s.name}: ${s.marks}`));

/** map — returns NEW array, same length */
console.log("map:", students.map((s) => s.name));

/** filter — returns NEW array, possibly shorter */
console.log("filter:", students.filter((s) => s.marks > 80).map((s) => s.name));

/** reduce — returns SINGLE value */
console.log("reduce:", students.reduce((sum, s) => sum + s.marks, 0));

// ─────────────────────────────────────────────────────────────
// 7. Chaining — සියල්ල එකට chain කරමු!
// ─────────────────────────────────────────────────────────────

console.log("\n--- 🎯 Chaining: Paid students' average ---");

const paidAverage =
  students
    .filter((s) => s.paid)
    .map((s) => s.marks)
    .reduce((sum, m, _, arr) => sum + m / arr.length, 0);

console.log("Paid students' average:", paidAverage.toFixed(1));
