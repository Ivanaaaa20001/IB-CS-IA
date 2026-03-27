import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, get, update, remove } from
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

const form = document.getElementById("OrdersForm");
const productsDisplay = document.getElementById("productsDisplay");
const ordersList = document.getElementById("ordersList");

let pastries = {};


// Load Products

async function loadProducts() {
    const snap = await get(ref(db, "products"));
    pastries = snap.val() || {};

    productsDisplay.innerHTML = "<h3>Select Items</h3>";

    if (Object.keys(pastries).length === 0) {
        productsDisplay.innerHTML += "<p style='color:red'>No pastries in products yet.</p>";
        return;
    }

    for (let key in pastries) {
        const item = pastries[key];
        const div = document.createElement("div");
        div.style.marginBottom = "10px";

        div.innerHTML = `
            <label>${item.name} ($${item.price})</label>
            <input type="number" min="0" value="0" data-key="${key}" style="width:60px; margin-left:10px;">
        `;

        productsDisplay.appendChild(div);
    }
}


// Submit Order

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let items = {};
    const inputs = productsDisplay.querySelectorAll("input[type='number']");

    inputs.forEach(input => {
        const qty = parseInt(input.value);
        if (qty > 0) {
            items[input.dataset.key] = qty;
        }
    });

    if (Object.keys(items).length === 0) {
        alert("Please select at least one item.");
        return;
    }

    // Ingredient availability check 
    let insufficient = [];
    for (let prodKey in items) {
        const qtyOrdered = items[prodKey];
        const product = pastries[prodKey];
        if (!product || !product.recipe) continue;

        for (let ingId in product.recipe) {
            const perUnit = product.recipe[ingId];
            const totalNeeded = perUnit * qtyOrdered;

            // Get current inventory for this ingredient
            const invSnap = await get(ref(db, "inventory/" + ingId));
            const invItem = invSnap.val();
            if (!invItem) continue;

            if (invItem.quantity < totalNeeded) {
                insufficient.push(
                  `${invItem.name}: need ${totalNeeded} ${invItem.unit}, available ${invItem.quantity} ${invItem.unit}`
                );
            }
        }
    }

    if (insufficient.length > 0) {
        const proceed = confirm(
          "Not enough ingredients in inventory to fulfill this order: \n\n" +
          insufficient.join("\n") +
          "\n\nDo you still want to place this order?"
        );
        if (!proceed) {
            return; 
        }
    }

    // If user okay,  
    let totalPrice = 0;
    for (let key in items) {
        totalPrice += (pastries[key]?.price || 0) * items[key];
    }

    const newOrderRef = push(ref(db, "orders"));
    await set(newOrderRef, {
        clientName: document.getElementById("clientName").value,
        address: document.getElementById("address").value,
        phone: document.getElementById("phone").value,
        date: document.getElementById("date").value,
        status: "pending",
        items,
        totalPrice,
        createdAt: Date.now()
    });

    form.reset();
    loadProducts();

    alert("Order submitted successfully!");
});




// Display Orders

onValue(ref(db, "orders"), async (snapshot) => {
    ordersList.innerHTML = "";

    const ordersData = snapshot.val() || {};
    const template = document.getElementById("order-template");



    const orderEntries = Object.entries(ordersData).sort(([, a], [, b]) => {
        const aTime = a?.createdAt ?? 0;
        const bTime = b?.createdAt ?? 0;
        return bTime - aTime;
    });

    for (const [id, order] of orderEntries) {
        const clone = template.content.cloneNode(true);

        const nameEl = clone.querySelector(".order-name");
        const statusEl = clone.querySelector(".order-status");
        const detailsEl = clone.querySelector(".order-details");
        const infoEl = clone.querySelector(".order-info");

        const detailsBtn = clone.querySelector(".details-btn");
        const deleteBtn = clone.querySelector(".delete-btn");
        const deliverBtn = clone.querySelector(".deliver-btn");
        const cancelBtn = clone.querySelector(".cancel-btn");

        // Summary
        nameEl.textContent = order.clientName;
        statusEl.textContent = order.status;

        // Order details
        infoEl.textContent =
            `Date: ${order.date}
Phone: ${order.phone}
Address: ${order.address}
Total: $${order.totalPrice}`;


        detailsBtn.addEventListener("click", () => {
            const isHidden = detailsEl.classList.toggle("hidden");
            detailsBtn.textContent = isHidden ? "View Details" : "Hide Details";
        });

    
        if (order.status !== "pending") {
            deliverBtn.classList.add("hidden");
            cancelBtn.classList.add("hidden");
        }

        // Delete button
        if (order.status !== "cancelled" && order.status !== "delivered") {
            deleteBtn.classList.add("hidden");
        }

        // Mark as Delivered
        deliverBtn.addEventListener("click", async () => {
            await update(ref(db, "orders/" + id), { status: "delivered" });

            // Reload products if missing (defensive)
            if (!pastries || Object.keys(pastries).length === 0) {
                const prodSnap = await get(ref(db, "products"));
                pastries = prodSnap.val() || {};
            }

            // Calculate ingredient totals
            const ingredientTotals = {};

            for (let productKey in order.items) {
                const qty = order.items[productKey];
                const product = pastries[productKey];
                if (!product || !product.recipe) continue;

                for (let ingId in product.recipe) {
                    const perUnit = product.recipe[ingId];
                    const amountNeeded = perUnit * qty;

                    ingredientTotals[ingId] =
                        (ingredientTotals[ingId] || 0) + amountNeeded;
                }
            }

            // Deduct inventory
            for (let ingId in ingredientTotals) {
                const invSnap = await get(ref(db, "inventory/" + ingId));
                const invItem = invSnap.val();
                if (!invItem) continue;

                const newQty = invItem.quantity - ingredientTotals[ingId];
                await update(ref(db, "inventory/" + ingId), {
                    quantity: Math.max(newQty, 0)
                });
            }

            // Update finances
            const financeRef = ref(db, "finances");
            const financeSnap = await get(financeRef);
            const financeData = financeSnap.val() || {
                expenses: 0,
                earnings: 0,
                profit: 0
            };

            const newEarnings =
                (financeData.earnings || 0) + (order.totalPrice || 0);

            await update(financeRef, {
                earnings: newEarnings,
                profit: newEarnings - (financeData.expenses || 0)
            });
        });

        // Mark as Cancelled
        cancelBtn.addEventListener("click", async () => {
            await update(ref(db, "orders/" + id), { status: "cancelled" });
        });

        // Delete Order
        deleteBtn.addEventListener("click", async () => {
            
            await remove(ref(db, "orders/" + id));
        });

        ordersList.appendChild(clone);
    }
});



// Load products on startup
loadProducts();