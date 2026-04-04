/**
 * ═══════════════════════════════════════════════════════════════
 *  Session 2 — DOM Manipulation
 *  Selecting, Modifying, Creating Elements, Events
 *  (objects-demo.html එක open කරන්න browser එකේ)
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// 1. Selecting Elements (Elements select කරගන්න)
// ─────────────────────────────────────────────────────────────

/** getElementById — ID එකෙන් එක element එකක් */
const title = document.getElementById("title");
console.log("getElementById:", title);

/** querySelector — CSS selector එකෙන් පළමු match එක */
const subtitle = document.querySelector(".subtitle");
console.log("querySelector:", subtitle);

/** querySelectorAll — CSS selector එකට match වෙන හැම එකම */
const items = document.querySelectorAll(".item");
console.log("querySelectorAll:", items);

// ─────────────────────────────────────────────────────────────
// 2. Changing Content (Content වෙනස් කරමු)
// ─────────────────────────────────────────────────────────────

/** textContent — plain text විතරයි */
title.textContent = "DOM Manipulation Demo ✨";

/** innerHTML — HTML tags ඇතුලත් කරන්න පුළුවන් */
subtitle.innerHTML = 'Learning <strong>DOM</strong> with <em>JavaScript</em>';

// ─────────────────────────────────────────────────────────────
// 3. Changing Styles & Classes
// ─────────────────────────────────────────────────────────────

/** Style එක directly වෙනස් කරමු */
title.style.color = "#2563eb";
title.style.borderBottom = "2px solid #2563eb";
title.style.paddingBottom = "8px";

/** Classes add/remove/toggle කරමු */
const output = document.getElementById("output");
output.classList.add("highlight");

// ─────────────────────────────────────────────────────────────
// 4. Creating Elements Dynamically (Elements අලුතෙන් හදමු)
// ─────────────────────────────────────────────────────────────

const studentList = document.getElementById("student-list");

/** Helper: student card එකක් හදන function */
const createStudentCard = (name) => {
  const li = document.createElement("li");
  li.textContent = name;
  li.style.cssText =
    "padding:8px 12px; margin:4px 0; background:#f0f9ff; border-radius:6px; display:flex; justify-content:space-between; align-items:center;";

  /** Delete button එක එකතු කරමු */
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  deleteBtn.style.cssText =
    "background:#ef4444; color:white; border:none; border-radius:4px; padding:2px 8px; cursor:pointer;";
  deleteBtn.addEventListener("click", () => li.remove());

  li.appendChild(deleteBtn);
  return li;
};

// ─────────────────────────────────────────────────────────────
// 5. Event Listeners (Events — click, input, submit)
// ─────────────────────────────────────────────────────────────

const addBtn = document.getElementById("add-btn");
const nameInput = document.getElementById("name-input");

/** Click event — button click එකෙන් student add කරනවා */
addBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    output.textContent = "⚠️ Please enter a name!";
    output.style.color = "#ef4444";
    return;
  }

  studentList.appendChild(createStudentCard(name));
  output.textContent = `✅ "${name}" added!`;
  output.style.color = "#16a34a";
  nameInput.value = "";
  nameInput.focus();
});

/** Keypress event — Enter key එකෙන්ද add කරමු */
nameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addBtn.click();
});

/** Input event — type කරද්දී live preview */
nameInput.addEventListener("input", (e) => {
  const count = studentList.children.length;
  output.textContent = `Typing: "${e.target.value}" | Students: ${count}`;
  output.style.color = "#6b7280";
});

// ─────────────────────────────────────────────────────────────
// 6. Event Delegation (Parent එකට listener එකක් දාලා children handle කරමු)
// ─────────────────────────────────────────────────────────────

/** List එකට click delegate කරමු — li click කළාම highlight වෙනවා */
studentList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    /** Toggle highlight on click */
    e.target.style.background =
      e.target.style.background === "rgb(219, 234, 254)"
        ? "#f0f9ff"
        : "#dbeafe";
  }
});

// ─────────────────────────────────────────────────────────────
// 7. Initial Data — demo data load කරමු
// ─────────────────────────────────────────────────────────────

console.log("--- DOM Loaded ---");
["Kasun", "Nimali", "Ruwan"].forEach((name) => {
  studentList.appendChild(createStudentCard(name));
});
output.textContent = "3 students loaded. Add more above!";
output.style.color = "#6b7280";
