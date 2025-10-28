# Quick Start Guide - Bobby's Bakery Website

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Firebase (5 minutes)

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "bobbys-bakery"
3. Enable **Realtime Database** (start in test mode)
4. Enable **Email/Password Authentication**
5. Add admin users (Ana and Maria's emails)

### Step 2: Configure Your Website

1. Get your Firebase config from Project Settings
2. Edit `js/firebase-config.js`
3. Replace placeholder values with your actual Firebase config

### Step 3: Add Sample Data

**Option A - Quick Import:**
1. In Firebase Console → Realtime Database
2. Click menu (⋮) → Import JSON
3. Upload `sample-data.json`

**Option B - Use Admin Panel:**
1. Open your website
2. Go to `/admin/index.html`
3. Login with admin credentials
4. Add products manually

### Step 4: Test Locally

```bash
# Serve the website locally
python -m http.server 8000
# Or
python3 -m http.server 8000
```

Open browser to: `http://localhost:8000`

### Step 5: Deploy (Optional)

**GitHub Pages (Easiest):**
1. Push to GitHub
2. Settings → Pages → Enable
3. Done! ✅

**Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📋 What You Get

### Customer Features
- ✅ Browse products with images & prices
- ✅ Add to cart with quantity selection
- ✅ Place orders with delivery details
- ✅ Choose delivery date and time
- ✅ Mobile-responsive design

### Admin Features  
- ✅ View all orders in one place
- ✅ Filter by status (pending/confirmed/completed)
- ✅ Calendar view of scheduled orders
- ✅ Manage products (add/edit/delete)
- ✅ Set daily order limits
- ✅ Update order status
- ✅ Secure login

## 🔐 Admin Access

**URL:** `your-website.com/admin/index.html`

**Default Login:** Use the email/password you created in Firebase Authentication

## 📱 Key URLs

- **Main Site:** `/index.html`
- **Admin Panel:** `/admin/index.html`
- **Documentation:** See `README.md` for full details
- **Setup Help:** See `FIREBASE_SETUP.md` for detailed Firebase instructions

## 🎨 Customization

### Change Colors
Edit `styles.css` - look for CSS variables:
```css
:root {
    --primary-color: #d4956b;  /* Main brown/tan */
    --secondary-color: #8b6f47; /* Dark brown */
    --accent-color: #e8b896;    /* Light tan */
}
```

### Change Logo/Title
Edit `index.html` - look for:
```html
<div class="logo">Bobby's Bakery</div>
```

### Add Real Images
1. Upload images to a hosting service
2. In admin panel, add image URLs when creating products
3. Or edit products in Firebase Console directly

## 🆘 Troubleshooting

**Products not showing?**
- Check Firebase config is correct
- Import sample-data.json
- Check browser console for errors

**Can't login to admin?**
- Verify email/password in Firebase Authentication
- Check you enabled Email/Password auth method

**Orders not saving?**
- Check Firebase database rules
- Verify database URL in config

## 📞 Support

Need help? Check:
- Full README.md
- FIREBASE_SETUP.md
- [Firebase Documentation](https://firebase.google.com/docs)

## ✨ Next Steps

1. Customize colors and branding
2. Add real product images
3. Test ordering flow
4. Train Ana & Maria on admin panel
5. Share website with customers!

---

**Built for Bobby's Bakery** 🥐🍰🧁
