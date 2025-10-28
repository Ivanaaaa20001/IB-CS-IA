// Shopping Cart Management
let cart = [];

// Load cart from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    updateCartDisplay();
});

function addToCart(productId, productName, price) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value);
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex > -1) {
        // Update quantity if product exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new product to cart
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity
        });
    }
    
    // Save cart to localStorage
    saveCartToStorage();
    
    // Update display
    updateCartDisplay();
    
    // Show feedback
    showNotification(`Added ${quantity} ${productName} to cart!`);
    
    // Scroll to cart section
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    
    // Reset quantity to 1
    quantityInput.value = 1;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartDisplay();
    showNotification('Item removed from cart');
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const orderForm = document.getElementById('order-form');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty. Add some delicious pastries!</p>';
        totalAmountSpan.textContent = '0.00';
        orderForm.style.display = 'none';
        return;
    }
    
    // Display cart items
    cartItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}</div>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">Remove</button>
        `;
        
        cartItemsDiv.appendChild(cartItemDiv);
    });
    
    totalAmountSpan.textContent = total.toFixed(2);
    orderForm.style.display = 'block';
}

function saveCartToStorage() {
    localStorage.setItem('bobbys-bakery-cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('bobbys-bakery-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartDisplay();
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '250px';
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
