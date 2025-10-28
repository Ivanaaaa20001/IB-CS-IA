// Admin Panel JavaScript
let currentUser = null;
let currentFilter = 'all';

// HTML escape function to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showDashboard();
            loadOrders();
            loadProducts();
            loadSettings();
            initializeCalendar();
        } else {
            showLogin();
        }
    });

    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Product form handler
    const productForm = document.getElementById('new-product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleAddProduct);
    }

    // Settings form handler
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSaveSettings);
    }
});

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            showDashboard();
            loadOrders();
            loadProducts();
            loadSettings();
        })
        .catch((error) => {
            alert('Login failed: ' + error.message);
        });
}

function handleLogout() {
    firebase.auth().signOut()
        .then(() => {
            currentUser = null;
            showLogin();
        })
        .catch((error) => {
            alert('Logout failed: ' + error.message);
        });
}

function showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Orders Management
function loadOrders() {
    const ordersListDiv = document.getElementById('orders-list');
    const ordersRef = window.db.ref('orders');

    ordersRef.on('value', (snapshot) => {
        const orders = snapshot.val();

        if (!orders) {
            ordersListDiv.innerHTML = '<p class="loading">No orders yet.</p>';
            return;
        }

        displayOrders(orders);
    });
}

function displayOrders(orders) {
    const ordersListDiv = document.getElementById('orders-list');
    ordersListDiv.innerHTML = '';

    // Convert to array and sort by date (newest first)
    const ordersArray = Object.entries(orders).map(([id, order]) => ({
        id,
        ...order
    })).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // Filter orders based on current filter
    const filteredOrders = currentFilter === 'all' 
        ? ordersArray 
        : ordersArray.filter(order => order.status === currentFilter);

    if (filteredOrders.length === 0) {
        ordersListDiv.innerHTML = '<p class="loading">No orders match the selected filter.</p>';
        return;
    }

    filteredOrders.forEach(order => {
        const orderDiv = createOrderElement(order);
        ordersListDiv.appendChild(orderDiv);
    });
}

function createOrderElement(order) {
    const orderDiv = document.createElement('div');
    orderDiv.className = `order-item ${escapeHtml(order.status)}`;

    const orderDate = new Date(order.orderDate).toLocaleString();
    
    // Escape all user-provided content
    const itemsList = order.items.map(item => 
        `${escapeHtml(item.name)} x ${parseInt(item.quantity)} ($${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)})`
    ).join('<br>');

    const safeOrderId = escapeHtml(order.id.substr(-8));
    const safeStatus = escapeHtml(order.status);
    const safeCustomerName = escapeHtml(order.customerName);
    const safeCustomerPhone = escapeHtml(order.customerPhone);
    const safeCustomerEmail = escapeHtml(order.customerEmail);
    const safeDeliveryDate = escapeHtml(order.deliveryDate);
    const safeDeliveryTime = escapeHtml(order.deliveryTime);
    const safeDeliveryAddress = escapeHtml(order.deliveryAddress);
    const safeSpecialInstructions = order.specialInstructions ? escapeHtml(order.specialInstructions) : '';

    orderDiv.innerHTML = `
        <div class="order-header">
            <span class="order-id">Order #${safeOrderId}</span>
            <span class="order-status ${safeStatus}">${safeStatus.toUpperCase()}</span>
        </div>
        <div class="order-details">
            <div class="order-detail">
                <strong>Customer:</strong> ${safeCustomerName}
            </div>
            <div class="order-detail">
                <strong>Phone:</strong> ${safeCustomerPhone}
            </div>
            <div class="order-detail">
                <strong>Email:</strong> ${safeCustomerEmail}
            </div>
            <div class="order-detail">
                <strong>Order Date:</strong> ${orderDate}
            </div>
            <div class="order-detail">
                <strong>Delivery Date:</strong> ${safeDeliveryDate}
            </div>
            <div class="order-detail">
                <strong>Delivery Time:</strong> ${safeDeliveryTime}
            </div>
        </div>
        <div class="order-items">
            <strong>Items:</strong><br>
            ${itemsList}
        </div>
        <div class="order-detail">
            <strong>Delivery Address:</strong> ${safeDeliveryAddress}
        </div>
        ${order.specialInstructions ? `
            <div class="order-detail">
                <strong>Special Instructions:</strong> ${safeSpecialInstructions}
            </div>
        ` : ''}
        <div class="order-detail">
            <strong>Total Amount:</strong> $${parseFloat(order.totalAmount).toFixed(2)}
        </div>
        <div class="order-actions">
            <select onchange="updateOrderStatus('${safeOrderId}', this.value)" class="status-select">
                <option value="">Change Status...</option>
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="btn btn-delete btn-small" onclick="deleteOrder('${safeOrderId}')">Delete</button>
        </div>
    `;

    return orderDiv;
}

function filterOrders(status) {
    currentFilter = status;
    loadOrders();
}

function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;
    
    window.db.ref('orders/' + orderId + '/status').set(newStatus)
        .then(() => {
            alert('Order status updated successfully!');
        })
        .catch((error) => {
            alert('Error updating status: ' + error.message);
        });
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        window.db.ref('orders/' + orderId).remove()
            .then(() => {
                alert('Order deleted successfully!');
            })
            .catch((error) => {
                alert('Error deleting order: ' + error.message);
            });
    }
}

// Products Management
function loadProducts() {
    const productsListDiv = document.getElementById('products-list');
    const productsRef = window.db.ref('products');

    productsRef.on('value', (snapshot) => {
        const products = snapshot.val();

        if (!products) {
            productsListDiv.innerHTML = '<p class="loading">No products yet. Add your first product!</p>';
            return;
        }

        productsListDiv.innerHTML = '';

        Object.entries(products).forEach(([id, product]) => {
            const productDiv = createProductElement(id, product);
            productsListDiv.appendChild(productDiv);
        });
    });
}

function createProductElement(productId, product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-item';

    // Escape user-provided content
    const safeName = escapeHtml(product.name);
    const safeDescription = escapeHtml(product.description);
    const safeProductId = escapeHtml(productId);
    const safePrice = parseFloat(product.price).toFixed(2);

    productDiv.innerHTML = `
        <div class="product-item-info">
            <div class="product-item-name">${safeName}</div>
            <div class="product-item-price">$${safePrice}</div>
            <div>${safeDescription}</div>
            <div class="product-item-status">
                Status: ${product.available !== false ? 'Available' : 'Unavailable'}
            </div>
        </div>
        <div class="product-item-actions">
            <button class="btn btn-secondary btn-small" onclick="toggleProductAvailability('${safeProductId}', ${product.available !== false})">
                ${product.available !== false ? 'Mark Unavailable' : 'Mark Available'}
            </button>
            <button class="btn btn-delete btn-small" onclick="deleteProduct('${safeProductId}')">Delete</button>
        </div>
    `;

    return productDiv;
}

function showAddProductForm() {
    document.getElementById('add-product-form').style.display = 'block';
}

function hideAddProductForm() {
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('new-product-form').reset();
}

function handleAddProduct(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        imageUrl: document.getElementById('product-image').value || '',
        available: document.getElementById('product-available').checked
    };

    const productsRef = window.db.ref('products');
    productsRef.push(productData)
        .then(() => {
            alert('Product added successfully!');
            hideAddProductForm();
        })
        .catch((error) => {
            alert('Error adding product: ' + error.message);
        });
}

function toggleProductAvailability(productId, currentStatus) {
    window.db.ref('products/' + productId + '/available').set(!currentStatus)
        .then(() => {
            alert('Product availability updated!');
        })
        .catch((error) => {
            alert('Error updating product: ' + error.message);
        });
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        window.db.ref('products/' + productId).remove()
            .then(() => {
                alert('Product deleted successfully!');
            })
            .catch((error) => {
                alert('Error deleting product: ' + error.message);
            });
    }
}

// Settings Management
function loadSettings() {
    const settingsRef = window.db.ref('settings');
    
    settingsRef.once('value')
        .then((snapshot) => {
            const settings = snapshot.val();
            if (settings) {
                document.getElementById('daily-order-limit').value = settings.dailyOrderLimit || 20;
            }
        });
}

function handleSaveSettings(e) {
    e.preventDefault();

    const settings = {
        dailyOrderLimit: parseInt(document.getElementById('daily-order-limit').value)
    };

    window.db.ref('settings').set(settings)
        .then(() => {
            alert('Settings saved successfully!');
        })
        .catch((error) => {
            alert('Error saving settings: ' + error.message);
        });
}

// Calendar Management
function initializeCalendar() {
    const monthInput = document.getElementById('calendar-month');
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    monthInput.value = currentMonth;
    updateCalendar();
}

function updateCalendar() {
    const monthInput = document.getElementById('calendar-month').value;
    const [year, month] = monthInput.split('-').map(Number);
    
    const ordersRef = window.db.ref('orders');
    ordersRef.once('value')
        .then((snapshot) => {
            const orders = snapshot.val() || {};
            displayCalendar(year, month, orders);
        });
}

function displayCalendar(year, month, orders) {
    const calendarDiv = document.getElementById('calendar-display');
    calendarDiv.innerHTML = '';

    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'calendar-day-header';
        headerDiv.textContent = day;
        calendarDiv.appendChild(headerDiv);
    });

    // Get first day of month and number of days
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        calendarDiv.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Count orders for this date
        const ordersForDate = Object.values(orders).filter(order => 
            order.deliveryDate === dateStr
        ).length;

        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerHTML = `
            <div class="calendar-day-number">${day}</div>
            <div class="calendar-day-orders">${ordersForDate} order${ordersForDate !== 1 ? 's' : ''}</div>
        `;
        calendarDiv.appendChild(dayDiv);
    }
}
