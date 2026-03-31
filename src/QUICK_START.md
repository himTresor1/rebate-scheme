# 🚀 Quick Start Guide - Asset Financier Admin

## ⚠️ IMPORTANT: First Time Setup

### Step 1: Seed Demo Data ✅ REQUIRED
**You MUST do this first!**

1. Go to the login screen
2. Look at the **bottom-left corner**
3. Click the subtle gray button: **"Seed Demo Data"**
4. Confirm the action
5. Wait for success message

This creates all demo users including Asset Financier Admins.

---

## Step 2: Login as Asset Financier Admin

After seeding data, login with:

| Email | Password |
|-------|----------|
| `admin@bankofkigali.rw` | `BoK2024!` |
| `admin@equitybank.rw` | `Equity2024!` |
| `admin@visionfinance.rw` | `Vision2024!` |
| `admin@umurenge.rw` | `Umurenge2024!` |

**See `/DEMO_CREDENTIALS.md` for ALL 13 demo user accounts!**

---

## 🎯 What You'll See After Login

### Navigation Tabs (Top of Dashboard)
1. **Overview** - Dashboard with stats and quick actions
2. **Internal Users** - Staff management
3. **Bank Details** - Bank account configuration
4. **Applications** - View submitted applications
5. **Submit Application** - Multi-step rebate form

---

## 📋 Asset Financier Admin Features

### ✅ Overview Tab
- Personalized time-based greeting
- 4 vibrant stat cards:
  - Total Staff
  - Active Applications
  - Approved Applications
  - Pending Review
- **6 Quick Action Buttons**:
  1. Submit New Application
  2. Manage Staff
  3. Configure Bank Details
  4. View Application History
  5. Download Reports
  6. Contact Support

### ✅ Internal Users Tab (Staff Management)
**Add New Staff Members:**
- Click "Add Staff Member" button
- Fill in:
  - Full Name
  - Professional Email
  - Mobile Phone Number
  - Role (Staff or Officer)
- Temporary password sent via email

**Manage Existing Staff:**
- View all staff in a table
- Search by name or email
- Click "Manage Permissions" to assign:
  - Submit Applications
  - View Applications
  - Edit Applications
  - Upload Documents
  - Respond to Requests
  - View Bank Details
  - Update Bank Details
  - Record Loan Repayments
- Deactivate users
- See activity status

### ✅ Bank Details Tab
**Configure Bank Account for Rebate Disbursements:**
- Bank Name
- Account Name
- Account Number
- Branch Name
- SWIFT Code
- Edit and update anytime
- All changes are logged and notified to RGF Finance

### ✅ Applications Tab
**View Application History:**
- All submitted rebate applications
- Filter and search
- Track status
- View details

### ✅ Submit Application Tab
**Multi-Step Rebate Application Form:**
- Step 1: Applicant Information
- Step 2: Motorcycle/Vehicle Details
- Step 3: Loan/Financing Details
- Step 4: Supporting Documents
- Real-time compliance checks
- Automatic eligibility scoring

---

## 🐛 Troubleshooting

### "I don't see the Asset Financier Dashboard"

**Check the browser console (F12):**
```
=== AUTH CHECK ===
Current user: {...}
User role: ASSET_FINANCIER_ADMIN
==================
```

If the role is **NOT** `ASSET_FINANCIER_ADMIN`:
1. Sign out
2. Click "Seed Demo Data" on login screen
3. Login again with `emoto1@company.com` / `emoto123`

### "I see a yellow warning box"

This means your user role doesn't match any configured dashboard. The box will show:
- Your current role
- Full user object (for debugging)
- Instructions to fix

**Solution:** Seed the demo data and use the provided credentials.

---

## 📚 Other Demo Accounts

See `/DEMO_CREDENTIALS.md` for a complete list of all demo users including:
- System Admin
- Internal MFA Staff (Analyst, QA, CFO, Finance, Management)
- Claims Officer
- Multiple Asset Financier Admins

---

## 🎨 Design Notes

- **Color Scheme:** #023F40 green (strictly enforced)
- **Font:** Poppins (system-wide)
- **Layout:** Responsive with collapsible sidebar
- **Animations:** Motion/React for smooth transitions
- **Stats Cards:** Vibrant gradient cards with trend indicators

---

## 🔐 Security Features

- Role-based access control (RBAC)
- Granular permissions system
- Multi-factor authentication ready
- Audit trails on all bank detail changes
- Session management
- Encrypted credentials

---

## 💡 Tips

1. **Use Quick Actions** - Fastest way to navigate
2. **Seed Data First** - Always start here for demos
3. **Check Console** - Helpful debug info on login
4. **Permissions are Granular** - Assign only what staff need
5. **Bank Details are Sensitive** - Only admins can view/edit

---

**Need Help?** Check the console logs or the yellow debug box for detailed user information.