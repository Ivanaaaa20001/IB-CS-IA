// Products Management
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    // Reference to products in Firebase
    const productsRef = window.db.ref('products');
    
    productsRef.on('value', (snapshot) => {
        const products = snapshot.val();
        
        if (!products) {
            productsGrid.innerHTML = '<p class="loading">No products available yet. Check back soon!</p>';
            return;
        }
        
        // Clear loading message
        productsGrid.innerHTML = '';
        
        // Display each product
        Object.keys(products).forEach(productId => {
            const product = products[productId];
            const productCard = createProductCard(productId, product);
            productsGrid.appendChild(productCard);
        });
    });
}

function createProductCard(productId, product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.imageUrl || 'https://via.placeholder.com/280x250?text=Delicious+Pastry'}" 
             alt="${product.name}" 
             class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
            ${product.available !== false ? `
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="decreaseQuantity('${productId}')">-</button>
                        <input type="number" 
                               id="qty-${productId}" 
                               class="quantity-input" 
                               value="1" 
                               min="1" 
                               max="50">
                        <button class="quantity-btn" onclick="increaseQuantity('${productId}')">+</button>
                    </div>
                    <button class="add-to-cart-btn" 
                            onclick="addToCart('${productId}', '${product.name}', ${product.price})">
                        Add to Cart
                    </button>
                </div>
            ` : '<p style="color: #e74c3c; font-weight: 600;">Currently Unavailable</p>'}
        </div>
    `;
    
    return card;
}

function increaseQuantity(productId) {
    const input = document.getElementById(`qty-${productId}`);
    const currentValue = parseInt(input.value);
    if (currentValue < parseInt(input.max)) {
        input.value = currentValue + 1;
    }
}

function decreaseQuantity(productId) {
    const input = document.getElementById(`qty-${productId}`);
    const currentValue = parseInt(input.value);
    if (currentValue > parseInt(input.min)) {
        input.value = currentValue - 1;
    }
}
