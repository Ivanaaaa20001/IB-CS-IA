import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, get, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const form = document.getElementById("ProductForm");
const recipeContainer = document.getElementById("recipeContainer");
const productsList = document.getElementById("productsList");

let inventory = {};


// Get ingredients from inventory
async function loadIngredients() {
    const snap = await get(ref(db, "inventory"));
    inventory = snap.val() || {};

    // Existing ingredients 
    const existingIngredients = recipeContainer.querySelectorAll("[data-ingredient]");
    existingIngredients.forEach(el => el.remove());

    if (Object.keys(inventory).length === 0) {
        const noIngMsg = document.createElement("p");
        noIngMsg.style.color = "red";
        noIngMsg.textContent = "No ingredients in inventory yet.";
        recipeContainer.appendChild(noIngMsg);
        return;
    }

    for (let key in inventory) {
        const item = inventory[key];
        const div = document.createElement("div");
        div.style.marginBottom = "10px";
        div.setAttribute("data-ingredient", key);

        const label = document.createElement("label");
        label.textContent = `${item.name} (${item.unit})`;
        div.appendChild(label);

        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.value = "0";
        input.dataset.key = key;
        input.style.width = "60px";
        input.style.marginLeft = "10px";
        div.appendChild(input);

        recipeContainer.appendChild(div);
    }
}


// Submit product
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Build recipe object
    const recipe = {};
    const inputs = recipeContainer.querySelectorAll("input[type='number']");

    inputs.forEach(input => {
        const qty = parseFloat(input.value);
        if (qty > 0) {
            recipe[input.dataset.key] = qty;
        }
    });

    if (Object.keys(recipe).length === 0) {
        alert("Please select at least one ingredient.");
        return;
    }

    // Build recipeText using inventory names/units
    let recipeTextParts = [];
    for (let ingId in recipe) {
        const amount = recipe[ingId];
        const ing = inventory[ingId];
        if (ing) {
            recipeTextParts.push(`${ing.name} (${amount} ${ing.unit})`);
        } else {
            // if ingredient is missing...
            recipeTextParts.push(`${ingId} (${amount})`);
        }
    }
    const recipeText = recipeTextParts.join(", ");

    const newProductRef = push(ref(db, "products"));
    await set(newProductRef, {
        name: document.getElementById("productName").value,
        price: parseFloat(document.getElementById("productPrice").value),
        recipe,          // link to inventory
        recipeText       // show string
    });

    form.reset();
    loadIngredients();

    alert("Product submitted successfully!");
});


// show available products: 
onValue(ref(db, "products"), (snapshot) => {
    productsList.innerHTML = "";
    const data = snapshot.val();
    const template = document.getElementById("product-template");

    if (!data) {
        const noProducts = document.createElement("li");
        noProducts.textContent = "No products yet";
        productsList.appendChild(noProducts);
        return;
    }

    for (let id in data) {
        const prod = data[id];
        const clone = template.content.cloneNode(true);

        const nameEl = clone.querySelector(".product-text");
        const recipeEl = clone.querySelector(".product-recipe");
        const detailsEl = clone.querySelector(".product-details");
        const detailsBtn = clone.querySelector(".details-btn");
        const delBtn = clone.querySelector(".delete-btn");

        const recipeText = prod.recipeText || "No recipe";

        nameEl.textContent = `${prod.name} - $${prod.price}`;

        recipeEl.textContent = `Recipe: ${recipeText}`;

        detailsBtn.addEventListener("click", () => {
            const isHidden = detailsEl.classList.toggle("hidden");
            detailsBtn.textContent = isHidden ? "View Details" : "Hide Details";
        });

        // Delete button
        delBtn.addEventListener("click", async () => {
            await remove(ref(db, "products/" + id));
        });

        productsList.appendChild(clone);
    }
});

// Initialize

loadIngredients();
