# Bobby's Bakery Website

A complete website for Bobby's Bakery, a family-run pastry business operated by sisters Ana and Maria. This website enables customers to browse products, place orders online, and provides an admin panel for business management.

## Features

### Customer-Facing Features
- **Product Catalog**: Browse all available pastries with descriptions and prices
- **Shopping Cart**: Add products to cart with quantity selection
- **Order Placement**: Submit orders with delivery information
- **Order Scheduling**: Choose preferred delivery date and time
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Admin Panel Features
- **Order Management**: View, filter, and manage all orders
- **Order Status Updates**: Update order status (pending, confirmed, completed, cancelled)
- **Order Calendar**: Visual calendar showing orders per day
- **Daily Order Limits**: Set maximum orders per day to manage capacity
- **Product Management**: Add, edit, and remove products
- **Product Availability**: Toggle product availability on/off
- **Secure Authentication**: Login required for admin access

## Firebase Integration

This website uses Firebase for:
- **Realtime Database**: Store products, orders, and settings
- **Authentication**: Secure admin panel access
- **Real-time Updates**: Automatic updates when data changes

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Firebase Realtime Database**:
   - Go to Realtime Database in the left menu
   - Click "Create Database"
   - Start in test mode (you can set up security rules later)
4. Enable **Authentication**:
   - Go to Authentication in the left menu
   - Click "Get Started"
   - Enable "Email/Password" sign-in method
   - Add your admin users (Ana and Maria's email addresses)

### 2. Configure Firebase in the Website

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" and click the web icon (</>)
3. Register your app and copy the Firebase configuration
4. Open `js/firebase-config.js` in your project
5. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};
```

### 3. Initialize Database with Sample Data

You can add sample products directly through the admin panel, or use Firebase Console:

1. Go to Realtime Database in Firebase Console
2. Click "+" to add data at the root level
3. Add sample products structure:

```json
{
  "products": {
    "product1": {
      "name": "Chocolate Croissant",
      "description": "Flaky croissant filled with rich chocolate",
      "price": 4.50,
      "available": true,
      "imageUrl": "https://via.placeholder.com/280x250?text=Chocolate+Croissant"
    },
    "product2": {
      "name": "Strawberry Tart",
      "description": "Fresh strawberries on vanilla custard",
      "price": 5.00,
      "available": true,
      "imageUrl": "https://via.placeholder.com/280x250?text=Strawberry+Tart"
    }
  },
  "settings": {
    "dailyOrderLimit": 20
  }
}
```

### 4. Deploy the Website

#### Option A: GitHub Pages (Free)
1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select your branch and root folder
4. Your site will be available at `https://yourusername.github.io/repository-name/`

#### Option B: Firebase Hosting (Free)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

#### Option C: Other Hosting Services
You can also use Netlify, Vercel, or any web hosting service that supports static sites.

### 5. Access the Website

- **Customer Site**: `https://your-domain.com/index.html`
- **Admin Panel**: `https://your-domain.com/admin/index.html`

### 6. Admin Login

Use the email and password you set up in Firebase Authentication to log into the admin panel.

## File Structure

```
IB-CS-IA/
├── index.html              # Main customer-facing page
├── styles.css              # Main stylesheet
├── README.md              # This file
├── js/
│   ├── firebase-config.js # Firebase configuration
│   ├── products.js        # Product display logic
│   ├── cart.js            # Shopping cart functionality
│   └── orders.js          # Order placement logic
└── admin/
    ├── index.html         # Admin panel page
    ├── admin-styles.css   # Admin panel styles
    └── admin.js           # Admin panel functionality
```

## Usage Guide

### For Customers

1. **Browse Products**: Scroll to the "Our Delicious Pastries" section
2. **Add to Cart**: Select quantity and click "Add to Cart"
3. **Place Order**: Scroll to "Place Your Order" section
4. **Fill Form**: Enter delivery details and preferred date/time
5. **Submit**: Click "Place Order" to submit

### For Administrators (Ana & Maria)

1. **Login**: Go to `/admin/index.html` and login with credentials
2. **View Orders**: Orders tab shows all orders with filters
3. **Update Status**: Change order status as you process them
4. **Manage Products**: Add new products or toggle availability
5. **Set Limits**: Configure daily order limits in Settings tab
6. **Calendar View**: See orders scheduled by date

## Security Recommendations

1. **Set up Firebase Security Rules**:
```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": "auth != null"
    },
    "orders": {
      ".read": "auth != null",
      ".write": true
    },
    "settings": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

2. **Use strong passwords** for admin accounts
3. **Enable 2FA** in Firebase Console for added security
4. **Regularly backup** your database

## Future Enhancements

Potential features to add:
- Payment integration (Stripe, PayPal)
- Email notifications for orders
- Customer accounts and order history
- Ingredient tracking and cost analysis
- Revenue reporting and analytics
- Image upload for products
- Customer reviews and ratings

## Support

For issues or questions, contact the development team or refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Realtime Database Guide](https://firebase.google.com/docs/database)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)

## License

MIT License - See LICENSE file for details

---

Built with ❤️ for Bobby's Bakery by Ana and Maria
