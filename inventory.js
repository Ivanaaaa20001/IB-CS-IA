import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update, get } from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const form = document.getElementById("IngredientForm");
const ingredientsList = document.getElementById("ingredientsList");


// Add ingredient
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("ingredientName").value.trim();
    const qty = parseFloat(document.getElementById("ingredientQty").value);
    const unit = document.getElementById("ingredientUnit").value.trim();
    const cost = parseFloat(document.getElementById("ingredientCost").value);

    if (!name || isNaN(qty) || !unit || isNaN(cost)) {
        alert("Enter a valid name, quantity, unit, and cost");
        return;
    }

    const newIngredientRef = push(ref(db, "inventory"));
    await set(newIngredientRef, {
        name,
        quantity: qty,
        unit,
        cost
    });

    //Update finances 
    const financeRef = ref(db, "finances");
    const snap = await get(financeRef);
    const data = snap.val() || {};
    const currentExpenses = data.expenses || 0;
    const currentEarnings = data.earnings || 0;

    await update(financeRef, {
        expenses: currentExpenses + cost,
        profit: currentEarnings - (currentExpenses + cost)
    });

    form.reset();
});



function renderItem(id, ing, template) {
    const clone = template.content.cloneNode(true);
    const li = clone.querySelector("li");

    const textSpan = clone.querySelector(".inventory-text");
    const infoEl = clone.querySelector(".inventory-info");
    const detailsEl = clone.querySelector(".inventory-details");

    const detailsBtn = clone.querySelector(".details-btn");
    const addQtyBtn = clone.querySelector(".add-qty-btn");
    const delBtn = clone.querySelector(".delete-btn");

    textSpan.textContent = `${ing.name} - ${ing.quantity} ${ing.unit}`;
    infoEl.textContent = `Cost: $${ing.cost || 0}`;

    detailsBtn.addEventListener("click", () => {
        const isHidden = detailsEl.classList.toggle("hidden");
        detailsBtn.textContent = isHidden ? "View Details" : "Hide Details";
    });

    delBtn.addEventListener("click", async () => {
        await remove(ref(db, "inventory/" + id));
    });

    addQtyBtn.addEventListener("click", () => {
        if (li.querySelector(".banner")) {
            return;
        }

        const editDiv = document.createElement("div");
        editDiv.classList.add("banner");

        const nameLabel = document.createElement("span");
        nameLabel.textContent = `${ing.name} - `;
        editDiv.appendChild(nameLabel);

        const qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.placeholder = "Amount";
        qtyInput.classList.add("add-qty-input");
        editDiv.appendChild(qtyInput);

        const costInput = document.createElement("input");
        costInput.type = "number";
        costInput.placeholder = "Cost (pesos)";
        costInput.classList.add("add-cost-input");
        editDiv.appendChild(costInput);

        const unitLabel = document.createElement("span");
        unitLabel.textContent = ` ${ing.unit}`;
        unitLabel.classList.add("add-qty-unit");
        editDiv.appendChild(unitLabel);

        const hint = document.createElement("p");
        hint.textContent = "If you want to subtract a quantity, add a negative number.";
        hint.classList.add("add-qty-hint");
        editDiv.appendChild(hint);

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.classList.add("add-qty-save");

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.classList.add("add-qty-cancel");

        saveBtn.addEventListener("click", async () => {
            const addAmount = parseFloat(qtyInput.value);
            const addCost = parseFloat(costInput.value);

            if (isNaN(addAmount) || isNaN(addCost)) {
                alert("Enter valid amount and cost");
                return;
            }

            const newQty = (ing.quantity || 0) + addAmount;
            const newCost = (ing.cost || 0) + addCost;

            await update(ref(db, "inventory/" + id), {
                quantity: newQty,
                cost: newCost
            });

            // Update finances 
            const financeRef = ref(db, "finances");
            const snap = await get(financeRef);
            const data = snap.val() || {};
            const currentExpenses = data.expenses || 0;
            const currentEarnings = data.earnings || 0;

            await update(financeRef, {
                expenses: currentExpenses + addCost,
                profit: currentEarnings - (currentExpenses + addCost)
            });

            editDiv.remove();
        });

        cancelBtn.addEventListener("click", () => {
            editDiv.remove();
        });

        editDiv.appendChild(saveBtn);
        editDiv.appendChild(cancelBtn);

        li.appendChild(editDiv);
    });

    return li;
}


// Inventory lsit: 
onValue(ref(db, "inventory"), (snapshot) => {
    ingredientsList.innerHTML = "";
    const data = snapshot.val();
    const template = document.getElementById("inventory-template");

    if (!data) {
        const noIng = document.createElement("li");
        noIng.textContent = "No ingredients yet";
        ingredientsList.appendChild(noIng);
        return;
    }

    for (let id in data) {
        const ing = data[id];
        const li = renderItem(id, ing, template);
        ingredientsList.appendChild(li);
    }
});
