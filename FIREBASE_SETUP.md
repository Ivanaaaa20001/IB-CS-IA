# Firebase Setup Guide for Bobby's Bakery

This guide will walk you through setting up Firebase for the Bobby's Bakery website.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: "bobbys-bakery" (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set Up Realtime Database

1. In the Firebase Console, click on "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a database location (select closest to your customers)
4. Start in **test mode** for now (we'll secure it later)
5. Click "Enable"

## Step 3: Configure Authentication

1. Click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 4: Create Admin Users

1. Still in Authentication, go to the "Users" tab
2. Click "Add user"
3. Enter Ana's email and create a password
4. Click "Add user"
5. Repeat for Maria's account

**Important**: Share these credentials securely with Ana and Maria!

## Step 5: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Register app with nickname: "Bobby's Bakery Website"
6. Copy the firebaseConfig object that appears
7. Don't worry about Firebase Hosting for now

## Step 6: Update Your Code

1. Open `js/firebase-config.js` in your project
2. Replace the placeholder config with your actual config:

```javascript
const firebaseConfig = {
    apiKey: "AIza...",  // Your actual values here
    authDomain: "bobbys-bakery-xxxxx.firebaseapp.com",
    databaseURL: "https://bobbys-bakery-xxxxx-default-rtdb.firebaseio.com",
    projectId: "bobbys-bakery-xxxxx",
    storageBucket: "bobbys-bakery-xxxxx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

## Step 7: Import Sample Data

1. In Firebase Console, go to Realtime Database
2. Click on the three dots (⋮) next to the database name
3. Select "Import JSON"
4. Upload the `sample-data.json` file from this project
5. Or manually add data using the Firebase Console UI

## Step 8: Set Up Security Rules

Once everything is working, secure your database:

1. Go to Realtime Database
2. Click on the "Rules" tab
3. Replace the rules with:

```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": "auth != null"
    },
    "orders": {
      ".read": "auth != null",
      ".write": true,
      ".indexOn": ["deliveryDate", "status", "orderDate"]
    },
    "settings": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

4. Click "Publish"

### Explanation of Security Rules:

- **products**: 
  - Anyone can read (view products)
  - Only authenticated users can write (add/edit products)
  
- **orders**: 
  - Only authenticated users can read (view orders in admin panel)
  - Anyone can write (customers can place orders)
  - Indexed fields for efficient queries
  
- **settings**: 
  - Anyone can read (check order limits)
  - Only authenticated users can write (change settings)

## Step 9: Test the Website

1. Open `index.html` in a web browser
2. Check that products load (if you've added them)
3. Try adding items to cart
4. Try placing an order
5. Go to `/admin/index.html`
6. Login with Ana or Maria's credentials
7. Verify orders appear in the admin panel

## Step 10: Deploy (Optional)

### Option A: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Select your project
# Set public directory to current directory (.)
# Configure as single-page app: No
# Don't overwrite index.html

# Deploy
firebase deploy
```

Your site will be live at: `https://your-project-id.web.app`

### Option B: GitHub Pages

1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select branch and root folder
4. Save

Your site will be at: `https://username.github.io/repository-name/`

## Troubleshooting

### Products Not Loading
- Check browser console for errors
- Verify Firebase config is correct
- Check database has products data
- Verify database rules allow reading

### Can't Login to Admin Panel
- Verify email/password in Firebase Authentication
- Check browser console for errors
- Ensure auth is enabled in Firebase

### Orders Not Saving
- Check browser console for errors
- Verify database rules allow writing to orders
- Check Firebase quota limits

### CORS Errors
- Make sure you're accessing the site via HTTP/HTTPS, not file://
- Use a local server (python -m http.server) for testing

## Database Structure

Your Firebase database should follow this structure:

```
{
  "products": {
    "productId1": {
      "name": "Product Name",
      "description": "Description",
      "price": 10.00,
      "available": true,
      "imageUrl": "https://..."
    }
  },
  "orders": {
    "orderId1": {
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "555-0123",
      "deliveryAddress": "123 Main St",
      "deliveryDate": "2025-11-01",
      "deliveryTime": "morning",
      "items": [...],
      "totalAmount": 25.50,
      "status": "pending",
      "orderDate": "2025-10-28T12:00:00.000Z"
    }
  },
  "settings": {
    "dailyOrderLimit": 20
  }
}
```

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- Check browser console for error messages
- Verify all configuration steps were completed

## Cost Information

Firebase offers a free tier (Spark Plan) that includes:
- Realtime Database: 1GB storage, 10GB/month downloads
- Authentication: Unlimited users
- Hosting: 10GB storage, 360MB/day transfer

This should be more than enough for a small bakery business!
