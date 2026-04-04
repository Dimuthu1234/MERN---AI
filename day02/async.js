/**
 * ═══════════════════════════════════════════════════════════════
 *  Session 2 — Async JavaScript
 *  Callbacks, Promises, async/await, fetch API
 *  (async-demo.html එක open කරන්න browser එකේ)
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// 1. Callbacks (Callback = "මට call කරන්න")
// ─────────────────────────────────────────────────────────────

console.log("--- Callbacks ---");

const fetchStudent = (id, callback) => {
  console.log(`Fetching student ${id}...`);
  setTimeout(() => {
    callback({ id, name: "Kasun", course: "MERN" });
  }, 1000);
};

fetchStudent(1, (student) => {
  console.log("Got student:", student);
});

console.log("This runs FIRST! (async නිසා)");

// ─────────────────────────────────────────────────────────────
// 2. Promises (Promise = "මම පොරොන්දු වෙනවා result එකක් දෙන්නම්")
// ─────────────────────────────────────────────────────────────

console.log("\n--- Promises ---");

const checkPayment = (studentName) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const paid = Math.random() > 0.3;
      if (paid) {
        resolve(`${studentName} has paid ✅`);
      } else {
        reject(`${studentName} payment pending ❌`);
      }
    }, 1500);
  });
};

/** .then() / .catch() — Promise handle කරන ක්‍රමය */
checkPayment("Nimali")
  .then((msg) => console.log("Promise resolved:", msg))
  .catch((err) => console.log("Promise rejected:", err));

// ─────────────────────────────────────────────────────────────
// 3. async/await (Promises ලස්සනට ලියන ක්‍රමය)
// ─────────────────────────────────────────────────────────────

console.log("\n--- async/await ---");

const checkEnrollment = async () => {
  try {
    const result = await checkPayment("Ruwan");
    console.log("Await result:", result);
  } catch (error) {
    console.log("Await error:", error);
  }
};

checkEnrollment();

// ─────────────────────────────────────────────────────────────
// 4. Fetch API — Real data ගන්නවා JSONPlaceholder එකෙන්
// ─────────────────────────────────────────────────────────────

console.log("\n--- Fetch API ---");

/** fetch() returns a Promise */
const fetchUsers = async () => {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users"
    );
    const users = await response.json();

    console.log("Fetched users:");
    users.slice(0, 5).forEach((u) => {
      console.log(`  ${u.id}. ${u.name} (${u.email})`);
    });

    return users;
  } catch (error) {
    console.error("Fetch failed:", error);
  }
};

fetchUsers();

/** Single user fetch */
const fetchUser = async (id) => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  const user = await res.json();
  console.log(`\nUser ${id}:`, user.name, "-", user.company.name);
};

fetchUser(1);

// ─────────────────────────────────────────────────────────────
// 5. Error Handling (try/catch වලින් errors handle කරමු)
// ─────────────────────────────────────────────────────────────

console.log("\n--- Error Handling ---");

const fetchWithErrorHandling = async () => {
  try {
    /** මේක fail වෙනවා — URL එක වැරදියි */
    const res = await fetch("https://jsonplaceholder.typicode.com/invalid");

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log("Caught error:", error.message);
  } finally {
    console.log("This runs ALWAYS (success or fail)");
  }
};

fetchWithErrorHandling();

// ─────────────────────────────────────────────────────────────
// 6. DOM Integration — Button click එකෙන් users load කරමු
//    (async-demo.html එක open කළාම මේක run වෙනවා)
// ─────────────────────────────────────────────────────────────

const loadBtn = document.getElementById("load-btn");
const userContainer = document.getElementById("user-container");
const statusText = document.getElementById("status");

if (loadBtn) {
  loadBtn.addEventListener("click", async () => {
    loadBtn.disabled = true;
    statusText.textContent = "Loading...";
    statusText.style.color = "#2563eb";
    userContainer.innerHTML = "";

    try {
      const res = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      const users = await res.json();

      users.forEach((user) => {
        const card = document.createElement("div");
        card.style.cssText =
          "padding:12px; margin:8px 0; background:#f0f9ff; border-radius:8px; border-left:4px solid #2563eb;";
        card.innerHTML = `
          <strong>${user.name}</strong><br>
          <small>${user.email} | ${user.company.name}</small>
        `;
        userContainer.appendChild(card);
      });

      statusText.textContent = `Loaded ${users.length} users!`;
      statusText.style.color = "#16a34a";
    } catch (err) {
      statusText.textContent = `Error: ${err.message}`;
      statusText.style.color = "#ef4444";
    } finally {
      loadBtn.disabled = false;
    }
  });
}
