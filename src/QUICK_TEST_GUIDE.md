# ⚡ Quick Test Guide - Post-Approval Workflow
## 5-Minute Verification Test

---

## 🎯 **BEFORE YOU START**

1. **Seed the database first:**
   - Click **"🎯 Seed Demo Data"** button on login screen
   - Wait for success message
   - This creates all test data

---

## ✅ **TEST 1: Asset Financier - Lease Upload** (2 min)

**Login:** `admin@bankofkigali.rw` / `BoK2024!`

### **Steps:**
1. Click **"Applications"** in sidebar
2. **Filter:** "Approved - Pending Lease"
3. **Expected:** See 3 applications:
   - Samuel Habimana - RWF 500,000
   - Jean Paul Mugisha - RWF 520,000
   - Grace Mukamana - RWF 580,000

4. **Click on "Samuel Habimana"**
5. **Expected:** Blue section shows "Upload Signed Lease Agreement"
6. **Click:** "Upload Signed Lease" button
7. **Expected:** Modal opens
8. **Upload:** Any PDF file
9. **Click:** "Submit Lease"
10. **Expected:** 
    - ✅ Toast: "Lease uploaded successfully"
    - ✅ Status changes to "lease-review"
    - ✅ Application disappears from list

---

## ✅ **TEST 2: Rebate Manager - Lease Review** (1.5 min)

**Login:** `manager1@mfa.rw` / `Manager2024!`

### **Steps:**
1. **Check sidebar menu** - Should see:
   - Dashboard
   - Manager Review Queue
   - **⭐ Lease Review** (NEW)
   - All Applications
   - Profile Settings

2. **Click:** "Lease Review"
3. **Expected:** See Asset Financiers grouped by cards (3-level navigation)
   - Level 1: Asset Financier cards
   - Should see "Equity Bank Rwanda" with 1 lease pending

4. **Click:** "Equity Bank Rwanda" card
5. **Expected:** See list of applications with leases pending review
   - Rose Uwera - Opibus Moto - RWF 550,000
   - If you uploaded in Test 1: Samuel Habimana

6. **Click:** "Review Lease" button on an application
7. **Expected:** Full application detail view with:
   - Application details
   - Blue section with "View Document" button
   - Loan terms verification
   - Review checklist
   - "Approve Lease" and "Reject Lease" buttons

8. **Click:** "View Document" button
9. **Expected:** New browser tab opens showing simulated PDF viewer

10. **Click:** "Approve Lease" button
11. **Expected:** Modal opens with:
    - Title: "Approve Signed Lease"
    - Approval notes textarea (required)
    - Cancel and "Approve & Send to Finance" buttons

12. **Type approval notes:** "Lease agreement verified. All terms match approved application."
13. **Click:** "Approve & Send to Finance"
14. **Expected:**
    - ✅ Toast: "Lease approved successfully"
    - ✅ Status changes to "pending-payment"
    - ✅ Application disappears from Lease Review
    - ✅ Returns to Asset Financier list

---

## ✅ **TEST 3: Finance Officer - Payment Processing** (1.5 min)

**Login:** `finance1@mfa.rw` / `Finance2024!`

### **Steps:**
1. **Check sidebar menu** - Should see:
   - Dashboard
   - **⭐ Pending Payments**
   - Payment History
   - Profile Settings

2. **Click:** "Pending Payments"
3. **Expected:** See Asset Financiers grouped by cards (3-level navigation)
   - Level 1: Asset Financier cards with payment counts and total amounts
   - Should see "Equity Bank Rwanda" with 1 payment pending
   - Shows total amount: RWF 550,000

4. **Click:** "Equity Bank Rwanda" card
5. **Expected:** See list of applications pending payment
   - Rose Uwera - Opibus Moto - RWF 550,000
   - Shows days pending
   - If approved in Test 2: Additional applications

6. **Click:** "Process Payment" button on an application
7. **Expected:** Full payment detail view with:
   - Application details
   - Bank/payment details section
   - Approval history
   - Lease review notes (from Rebate Manager)
   - "Process Payment" button

8. **Click:** "Process Payment" button again
9. **Expected:** Modal opens with:
   - Payment summary
   - Pre-filled payment reference (e.g., PAY-2026-12345)
   - Payment notes field (optional)
   - Warning about irreversible action

10. **Optional - Add notes:** "Bank transfer via BoK corporate account"
11. **Click:** "Confirm & Process Payment"
12. **Expected:**
    - ✅ Toast: "Payment processed successfully"
    - ✅ Reference number shown
    - ✅ Status changes to "payment-complete"
    - ✅ Application disappears from Pending Payments
    - ✅ Returns to Asset Financier list

---

## 🎉 **SUCCESS CRITERIA**

If all 3 tests pass, the post-approval workflow is working correctly!

### **You should have verified:**
- ✅ Asset Financiers can upload leases for approved applications
- ✅ Rebate Managers have a "Lease Review" menu item
- ✅ Rebate Managers can approve/reject uploaded leases
- ✅ Finance Officers have a "Pending Payments" menu item
- ✅ Finance Officers can process payments
- ✅ Application status progresses correctly through all stages
- ✅ Toast notifications appear for all actions

---

## 🔄 **COMPLETE WORKFLOW STAGES**

```
1. Application Submitted (Asset Financier)
          ↓
2. Analyst Reviews (analyst@mfa.rw)
          ↓
3. Manager Reviews (manager@mfa.rw)
          ↓
4. Program Manager Approves (program.manager@mfa.rw)
          ↓
5. ⭐ LEASE UPLOAD (Asset Financier)
          ↓
6. ⭐ LEASE REVIEW (Rebate Manager)
          ↓
7. ⭐ PAYMENT PROCESSING (Finance Officer)
          ↓
8. COMPLETE ✓
```

---

## 🐛 **Troubleshooting**

### **Problem: No applications in "Approved - Pending Lease"**
**Solution:**
1. Reseed database: Click "Seed Demo Data" button
2. Logout and login again
3. Should now see 3 applications

### **Problem: "Lease Review" menu not showing**
**Solution:**
1. Verify logged in as: `manager1@mfa.rw` or `manager2@mfa.rw`
2. Hard refresh page (Ctrl+Shift+R)
3. If still missing, reseed database

### **Problem: "Upload Signed Lease" button not visible**
**Solution:**
1. Verify application status is "approved-pending-lease"
2. Click on the application to open detail view
3. Button should be in a blue highlighted section
4. If missing, reseed database

### **Problem: Modal doesn't open**
**Solution:**
1. Hard refresh page (Ctrl+Shift+R)
2. Check browser console for errors (F12)
3. Try different browser

---

## 📋 **All Test Credentials**

### **Quick Reference**

| User Type | Email | Password |
|-----------|-------|----------|
| **Asset Financier** | admin@bankofkigali.rw | BoK2024! |
| **Rebate Analyst** | analyst1@mfa.rw | Analyst2024! |
| **Rebate Manager** | manager1@mfa.rw | Manager2024! |
| **Program Manager** | program.manager@mfa.rw | ProgramMgr2024! |
| **Finance Officer** | finance1@mfa.rw | Finance2024! |
| **System Admin** | admin@mfa.rw | Admin2024! |

---

## 📄 **More Information**

- **Complete Testing Guide:** `/WORKFLOW_TEST_GUIDE.md`
- **System Verification Report:** `/SYSTEM_VERIFICATION_REPORT.md`
- **All Credentials:** `/DEMO_CREDENTIALS.md`

---

**Total Test Time:** ~5 minutes  
**Required Steps:** 22 actions across 3 user roles  
**Expected Result:** Full post-approval workflow verified ✅