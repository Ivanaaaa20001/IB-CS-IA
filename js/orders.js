// Order Management
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    // Set minimum date to today
    const deliveryDateInput = document.getElementById('delivery-date');
    if (deliveryDateInput) {
        const today = new Date().toISOString().split('T')[0];
        deliveryDateInput.setAttribute('min', today);
    }
});

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Check daily order limit before submitting
    const deliveryDate = document.getElementById('delivery-date').value;
    const canPlaceOrder = await checkOrderLimit(deliveryDate);
    
    if (!canPlaceOrder) {
        alert('Sorry, we have reached the maximum number of orders for this date. Please choose another date.');
        return;
    }
    
    // Get form data
    const orderData = {
        customerName: document.getElementById('customer-name').value,
        customerEmail: document.getElementById('customer-email').value,
        customerPhone: document.getElementById('customer-phone').value,
        deliveryAddress: document.getElementById('delivery-address').value,
        deliveryDate: deliveryDate,
        deliveryTime: document.getElementById('delivery-time').value,
        specialInstructions: document.getElementById('special-instructions').value,
        items: cart,
        totalAmount: parseFloat(document.getElementById('total-amount').textContent),
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    try {
        // Save order to Firebase
        const ordersRef = window.db.ref('orders');
        const newOrderRef = ordersRef.push();
        await newOrderRef.set(orderData);
        
        // Show success message
        alert('Order placed successfully! We will contact you soon to confirm your order.');
        
        // Clear cart and form
        clearCart();
        document.getElementById('order-form').reset();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error placing order:', error);
        alert('There was an error placing your order. Please try again or contact us directly.');
    }
}

async function checkOrderLimit(date) {
    try {
        // Get order limit setting from Firebase
        const settingsRef = window.db.ref('settings/dailyOrderLimit');
        const snapshot = await settingsRef.once('value');
        const dailyLimit = snapshot.val() || 20; // Default to 20 if not set
        
        // Count orders for the specified date
        const ordersRef = window.db.ref('orders');
        const ordersSnapshot = await ordersRef
            .orderByChild('deliveryDate')
            .equalTo(date)
            .once('value');
        
        const ordersCount = ordersSnapshot.numChildren();
        
        return ordersCount < dailyLimit;
    } catch (error) {
        console.error('Error checking order limit:', error);
        // Allow order to proceed if there's an error checking the limit
        return true;
    }
}
