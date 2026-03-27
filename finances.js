import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, get, update, push, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
//finances.js 
const firebaseConfig = {
    apiKey: "AIzaSyBAmlug6YrxjRJW1o23fEl-_uewXjTc-S4",
    authDomain: "ibcs-dc496.firebaseapp.com",
    databaseURL: "https://ibcs-dc496-default-rtdb.firebaseio.com",
    projectId: "ibcs-dc496",
    storageBucket: "ibcs-dc496.appspot.com",
    messagingSenderId: "594280981265",
    appId: "1:594280981265:web:44dbe88e16be7dc79b22b0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const expensesEl = document.getElementById("expenses");
const earningsEl = document.getElementById("earnings");
const profitEl = document.getElementById("profit");
const cutsList = document.getElementById("cutsList");

const addExpenseBtn = document.getElementById("addExpenseBtn");
const makeCutBtn = document.getElementById("makeCutBtn");
 
onValue(ref(db, "finances"), (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    expensesEl.textContent = `Expenses: $${data.expenses || 0}`;
    earningsEl.textContent = `Earnings: $${data.earnings || 0}`;
    profitEl.textContent = `Profit: $${data.profit || 0}`;
});

// Add external expense
addExpenseBtn.addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("externalExpenseAmount").value);
    const desc = document.getElementById("externalExpenseDesc").value.trim();

    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid expense amount");
        return;
    }

    const financeRef = ref(db, "finances");
    const snap = await get(financeRef);
    const data = snap.val() || { expenses: 0, earnings: 0, profit: 0 };

    const newExpenses = (data.expenses || 0) + amount;
    const newProfit = (data.earnings || 0) - newExpenses;

    await update(financeRef, {
        expenses: newExpenses,
        profit: newProfit
    });

    alert(`Added external expense: ${desc || "Misc"} ($${amount})`);
});

// Make a Financial Reset (Cut)
makeCutBtn.addEventListener("click", async () => {
    const financeRef = ref(db, "finances");
    const snap = await get(financeRef);
    const data = snap.val() || { expenses: 0, earnings: 0, profit: 0 };

    const cutsRef = push(ref(db, "finances/cuts"));
    await set(cutsRef, {
        date: new Date().toLocaleString(),
        expenses: data.expenses || 0,
        earnings: data.earnings || 0,
        profit: data.profit || 0
    });

    // Reset numbers
    await update(financeRef, {
        expenses: 0,
        earnings: 0,
        profit: 0
    });

    alert("Reset made successfully!");
});

// Cuts list
onValue(ref(db, "finances/cuts"), (snapshot) => {
    cutsList.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
        const noCuts = document.createElement("li");
        noCuts.textContent = "No financial resets yet";
        cutsList.appendChild(noCuts);
        return;
    }

    for (let id in data) {
        const cut = data[id];

        const li = document.createElement("li");
        li.className = "cut-item";

        const container = document.createElement("section");

        const title = document.createElement("h3");
        title.textContent = `Reset Date: ${cut.date}`;

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "view-cut-details";
        toggleBtn.textContent = "View details";

        const details = document.createElement("div");
        details.hidden = true;
        details.innerHTML = `
            <p>Expenses: $${cut.expenses}</p>
            <p>Earnings: $${cut.earnings}</p>
            <p>Profit: $${cut.profit}</p>
        `;

        toggleBtn.addEventListener("click", () => {
            const isHidden = details.hidden;
            details.hidden = !isHidden;
            toggleBtn.textContent = isHidden ? "Hide details" : "View details";
        });

        container.appendChild(title);
        container.appendChild(toggleBtn);
        container.appendChild(details);

        li.appendChild(container);
        cutsList.appendChild(li);
    }
});
