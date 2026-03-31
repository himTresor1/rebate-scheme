# 🧪 Complete Workflow Testing Guide
## MFA Rebate Scheme System - 4-Level Approval with Post-Approval Workflow

---

## 📋 **COMPLETE WORKFLOW OVERVIEW**

```
Asset Financier Submits Application
           ↓
    [LEVEL 1] Rebate Analyst Review
           ↓
    [LEVEL 2] Rebate Manager Review
           ↓
    [LEVEL 3] E-Moto Program Manager Review
           ↓
    [APPROVAL] Application Approved
           ↓
    **[POST-APPROVAL STAGE 1] Asset Financier Uploads Signed Lease**
           ↓
    **[POST-APPROVAL STAGE 2] Rebate Manager Reviews Lease**
           ↓
    **[POST-APPROVAL STAGE 3] Designated Finance Officer Processes Payment**
           ↓
    [COMPLETE] Payment Complete
```

---

## 🔑 **TEST CREDENTIALS**

### MFA Internal Staff

| Role | Email | Password | Name |
|------|-------|----------|------|
| **System Admin** | `admin@mfa.rw` | `Admin2024!` | System Administrator |
| **Rebate Analyst** | `analyst1@mfa.rw` | `Analyst2024!` | Alice Mugisha |
| **Rebate Analyst** | `analyst2@mfa.rw` | `Analyst2024!` | Brian Nkusi |
| **Rebate Manager** | `manager1@mfa.rw` | `Manager2024!` | Catherine Uwera |
| **Rebate Manager** | `manager2@mfa.rw` | `Manager2024!` | David Habimana |
| **E-Moto Program Manager** | `program.manager@mfa.rw` | `ProgramMgr2024!` | Tony Nsengimana |
| **Designated Finance Officer** | `finance1@mfa.rw` | `Finance2024!` | Finance Officer 1 |
| **M&E Team (View Only)** | `me1@mfa.rw` | `ME2024!` | M&E Officer 1 |

### Asset Financiers (Banks & MFIs)

| Organization | Email | Password |
|-------------|-------|----------|
| **Bank of Kigali** | `admin@bankofkigali.rw` | `BoK2024!` |
| **Equity Bank Rwanda** | `admin@equitybank.rw` | `Equity2024!` |
| **Vision Finance Company** | `admin@visionfinance.rw` | `Vision2024!` |
| **Umurenge SACCO** | `admin@umurenge.rw` | `Umurenge2024!` |

---

## 🎯 **STEP-BY-STEP TESTING PROCEDURE**

### **SETUP: Seed the Database**

1. **Go to login screen**
2. **Click "🎯 Seed Demo Data" button** (bottom-left corner)
3. **Wait 30-60 seconds** for completion
4. **Confirm success message** appears

---

## **TEST 1: Asset Financier - Application Submission**

### **Objective:** Verify Asset Financiers can submit applications

**Login:** `admin@bankofkigali.rw` / `BoK2024!`

### **Expected Menu Items:**
- ✅ Dashboard
- ✅ Internal Users
- ✅ Bank Details
- ✅ Applications
- ✅ Submit Application
- ✅ Repayment Tracking
- ✅ Profile Settings

### **Steps:**
1. Click **"Applications"** from sidebar
2. **Verify:** You see applications with different statuses
3. **Filter:** Look for applications with status **"Approved - Pending Lease"**
4. **Expected:** You should see **3 applications**:
   - Samuel Habimana - Ampersand E-Moto Gen 2 - RWF 500,000
   - Jean Paul Mugisha - Ampersand E-Moto Pro - RWF 520,000
   - Grace Mukamana - Opibus Moto Pro - RWF 580,000

### **Test Submit New Application:**
1. Click **"Submit Application"** from sidebar
2. Fill in all required fields
3. Submit application
4. **Expected:** Application appears in "Applications" list with status "pending"

---

## **TEST 2: Rebate Analyst - Level 1 Review**

### **Objective:** Verify Analysts can review assigned applications

**Login:** `analyst1@mfa.rw` / `Analyst2024!`

### **Expected Menu Items:**
- ✅ Dashboard
- ✅ Assigned Applications
- ✅ Review Queue
- ✅ Profile Settings

### **Steps:**
1. **Navigate to:** "Assigned Applications" or "Review Queue"
2. **Expected:** See applications in statuses:
   - `assigned`
   - `under-review`
3. **Verify Test Data:**
   - Should see applications from multiple financiers
   - Each application shows basic info (applicant name, rebate amount, status)

### **Perform Review:**
1. **Click on an application** in "assigned" or "under-review" status
2. **Expected View:**
   - Application details (personal info, motorcycle details, loan details)
   - Eligibility criteria checklist
   - Review notes textarea
   - Action buttons: "Approve", "Reject", "Request Clarification"
3. **Mark some criteria** as YES/NO
4. **Add review notes**
5. **Click "Approve"**
6. **Expected:** Application moves to status **"manager-review"**
7. **Toast notification:** "Application approved and sent to Rebate Manager"

---

## **TEST 3: Rebate Manager - Level 2 Review**

### **Objective:** Verify Rebate Managers can review applications from analysts

**Login:** `manager1@mfa.rw` / `Manager2024!`

### **Expected Menu Items:**
- ✅ Dashboard
- ✅ Manager Review Queue
- ✅ **Lease Review** ⭐ (NEW)
- ✅ All Applications
- ✅ Profile Settings

### **Steps:**
1. **Navigate to:** "Manager Review Queue"
2. **Expected:** See applications with status **"manager-review"**
3. **Verify:** Should see at least 2 applications from seed data

### **Perform Review:**
1. **Click on an application**
2. **Expected View:**
   - Full application details
   - Previous analyst evaluation (if available)
   - Manager-specific criteria checklist
   - Review notes
   - Action buttons: "Approve", "Reject", "Send Back to Analyst"
3. **Review the application**
4. **Click "Approve"**
5. **Expected:** Application moves to status **"program-manager-review"**
6. **Toast notification:** "Application approved and sent to E-Moto Program Manager"

---

## **TEST 4: E-Moto Program Manager - Level 3 Review**

### **Objective:** Verify Program Managers can give final approval

**Login:** `program.manager@mfa.rw` / `ProgramMgr2024!`

### **Expected Menu Items:**
- ✅ Dashboard
- ✅ Pending Approvals
- ✅ Flagged Applications
- ✅ Profile Settings

### **Steps:**
1. **Navigate to:** "Pending Approvals"
2. **Expected:** See applications with status **"program-manager-review"**
3. **Verify:** Should see at least 2 applications from seed data

### **Perform Final Approval:**
1. **Click on an application**
2. **Expected View:**
   - Complete application details
   - Analyst evaluation history
   - Manager evaluation history
   - Final approval criteria
   - Action buttons: "Approve", "Reject", "Flag for Investigation"
3. **Review all previous evaluations**
4. **Click "Approve"**
5. **Expected:** Application moves to status **"approved-pending-lease"** ⭐
6. **Toast notification:** "Application approved. Asset Financier will be notified to upload signed lease."

---

## **🆕 TEST 5: POST-APPROVAL STAGE 1 - Asset Financier Uploads Signed Lease**

### **Objective:** Verify Asset Financiers can upload signed lease after approval

**Login:** `admin@bankofkigali.rw` / `BoK2024!`

### **Steps:**
1. **Navigate to:** "Applications"
2. **Filter by status:** "Approved - Pending Lease"
3. **Expected:** You should see **3 applications**:
   - Samuel Habimana
   - Jean Paul Mugisha
   - Grace Mukamana
4. **Click on one of these applications**

### **Expected Application Detail View:**
- ✅ Full application information displayed
- ✅ **Blue highlighted section:** "Upload Signed Lease Agreement"
- ✅ **Button:** "Upload Signed Lease" (visible and enabled)

### **Perform Lease Upload:**
1. **Click "Upload Signed Lease"** button
2. **Expected:** Modal dialog opens with title "Upload Signed Lease Agreement"
3. **Modal contains:**
   - File upload zone (drag & drop or click)
   - File requirements text
   - Cancel and Submit buttons
4. **Select any PDF file** (simulation only - no actual storage)
5. **Click "Submit Lease"**
6. **Expected:**
   - Modal closes
   - Toast: "Lease uploaded successfully and sent for review"
   - Application status changes to **"lease-review"** ⭐
   - Application disappears from "Approved - Pending Lease" filter
7. **Close the detail modal** and verify the application is no longer in the list

---

## **🆕 TEST 6: POST-APPROVAL STAGE 2 - Rebate Manager Reviews Lease**

### **Objective:** Verify Rebate Managers can review uploaded leases

**Login:** `manager1@mfa.rw` / `Manager2024!`

### **Steps:**
1. **Navigate to:** **"Lease Review"** menu item ⭐
2. **Expected View:** 3-level navigation starting with Asset Financier groups
3. **Level 1 - Asset Financiers:**
   - See cards grouped by Asset Financier
   - Each card shows organization name and count of leases pending
   - Should see "Equity Bank Rwanda" with at least 1 lease
   - If you uploaded in Test 5: Also see "Bank of Kigali"

4. **Click:** "Equity Bank Rwanda" card
5. **Level 2 - Applications List:**
   - See applications with leases pending review
   - Rose Uwera (Equity Bank Rwanda) - Opibus Moto - RWF 550,000
   - Each application card shows:
     - Applicant name
     - Application ID
     - Motorcycle details
     - Rebate amount
     - Document name
     - "Review Lease" button

6. **Click:** "Review Lease" button on Rose Uwera's application
7. **Level 3 - Lease Review Detail:**

### **Expected Lease Review Detail View:**
- ✅ Back button to return to applications list
- ✅ Application details section
- ✅ **Blue section: "Uploaded Lease Document"**
  - Document filename
  - Upload date/time
  - **"View Document" button** ⭐
- ✅ Loan terms verification grid
- ✅ Review checklist (5 items)
- ✅ Action buttons: "Reject Lease" and "Approve Lease"

### **Test View Document Feature:**
1. **Click:** "View Document" button
2. **Expected:** 
   - New browser tab/window opens
   - Shows simulated PDF viewer with:
     - Document header with lease details
     - Application information grid
     - Document placeholder (UI-only simulation)
     - Timestamp footer
   - Toast notification: "Document opened in new tab"

### **Test Approve Workflow:**
1. **Click:** "Approve Lease" button
2. **Expected Modal Opens:**
   - Title: "Approve Signed Lease"
   - Description explaining the approval
   - **Approval Notes textarea (REQUIRED)** ⭐
   - Helper text: "These notes will be recorded..."
   - Buttons: "Cancel" and "Approve & Send to Finance"

3. **Type in Approval Notes:** 
   ```
   Lease agreement verified and approved. All terms match the approved application including loan amount RWF 3,300,000, term 36 months, interest rate 11.5%, and monthly payment RWF 108,000. Document is properly signed by both Rose Uwera and Equity Bank Rwanda.
   ```

4. **Click:** "Approve & Send to Finance"
5. **Expected:**
   - Modal closes
   - Toast: "Lease approved successfully. Application forwarded to Finance Officer."
   - Application status changes to **"pending-payment"** ⭐
   - Returns to Level 2 (applications list)
   - Approved application disappears from list
6. **Navigate back:** Click "Back to Asset Financiers"
7. **Verify:** If all Equity Bank leases are approved, the card shows 0 leases

### **Test Reject Workflow (Optional):**
1. **Upload another lease** (repeat Test 5 with Jean Paul Mugisha)
2. **Navigate to Lease Review** → Bank of Kigali → Select application
3. **Click:** "Reject Lease" button
4. **Expected Modal Opens:**
   - Title: "Reject Signed Lease"
   - Description about providing detailed notes
   - **Rejection Notes textarea (REQUIRED)** ⭐
   - Helper text: "Be specific about what needs correction..."
   - Buttons: "Cancel" and "Reject Lease" (red)

5. **Type rejection notes:**
   ```
   Loan term on lease shows 36 months but approved application shows 24 months. Please upload corrected lease with the correct 24-month term.
   ```

6. **Click:** "Reject Lease"
7. **Expected:**
   - Modal closes
   - Toast: "Lease rejected. Asset Financier notified."
   - Application status reverts to **"approved-pending-lease"**
   - Application disappears from Lease Review
   - Asset Financier can upload a new lease

---

## **🆕 TEST 7: POST-APPROVAL STAGE 3 - Designated Finance Officer Processes Payment**

### **Objective:** Verify Finance Officers can process approved payments

**Login:** `finance1@mfa.rw` / `Finance2024!`

### **Expected Menu Items:**
- ✅ Dashboard
- ✅ **Pending Payments** ⭐
- ✅ Payment History
- ✅ Profile Settings

### **Steps:**
1. **Navigate to:** "Pending Payments"
2. **Expected:** See applications with status **"pending-payment"**
3. **Verify:** Should see at least 1 application from seed data:
   - Emmanuel Nkurunziza (Vision Finance) - EV Electric Thunder E100 - RWF 480,000

### **Application Card Should Show:**
- Applicant name
- Organization
- Motorcycle details
- Rebate amount
- Lease approval info (approved by, approval date)
- "Process Payment" button

### **Perform Payment Processing:**
1. **Click "Process Payment"** on an application
2. **Expected Modal Opens:**
   - Title: "Process Rebate Payment"
   - Application summary
   - Lease approval details (who approved, when)
   - Payment information:
     - Rebate amount
     - Payment method (e.g., Bank Transfer)
     - Reference number field
   - "Confirm Payment" button

3. **Enter payment details:**
   - Payment reference number (e.g., "PAY-2026-12345")
4. **Click "Confirm Payment"**
5. **Expected:**
   - Modal closes
   - Toast: "Payment processed successfully!"
   - Application status changes to **"payment-complete"** ⭐
   - Application disappears from Pending Payments list
6. **Navigate to "Payment History"**
7. **Verify:** The processed application now appears in payment history

---

## **TEST 8: M&E Team - View Only Access**

### **Objective:** Verify M&E team can view data but not modify

**Login:** `me1@mfa.rw` / `ME2024!`

### **Expected Menu Items:**
- ✅ Dashboard
- ✅ View Applications
- ✅ Analytics
- ✅ Profile Settings

### **Steps:**
1. **Navigate to:** "View Applications"
2. **Expected:** See all applications (read-only)
3. **Verify:** No action buttons (no approve/reject/edit)
4. **Navigate to:** "Analytics"
5. **Expected:** See dashboard with statistics and charts
6. **Verify:** Can export reports but cannot modify data

---

## **TEST 9: System Admin - Full System Access**

### **Objective:** Verify System Admin can access all features

**Login:** `admin@mfa.rw` / `Admin2024!`

### **Expected Menu Items:**
- ✅ Dashboard
- ✅ All Applications
- ✅ Eligibility Criteria
- ✅ User Management
- ✅ Pending Registrations
- ✅ Invitations
- ✅ Roles
- ✅ Permissions
- ✅ Audit Logs
- ✅ Profile Settings

### **Steps:**
1. **Navigate to:** "All Applications"
2. **Verify:** Can see applications from ALL organizations in ALL statuses
3. **Check filters:** Should be able to filter by:
   - Status (all workflow stages)
   - Organization
   - Date range
4. **Navigate to:** "User Management"
5. **Verify:** Can see all users across all organizations
6. **Navigate to:** "Audit Logs"
7. **Verify:** Can see complete audit trail of all actions

---

## **TEST 10: Complete End-to-End Workflow**

### **Objective:** Test the complete workflow from submission to payment

### **Step 1: Submit Application**
**Login:** `admin@equitybank.rw` / `Equity2024!`
1. Navigate to "Submit Application"
2. Fill in all fields:
   - Applicant: "Test User Full Workflow"
   - National ID: "1199999999999999"
   - Phone: "+250788999999"
   - Email: "test.workflow@test.com"
   - Motorcycle Brand: "Ampersand"
   - Model: "E-Moto Gen 2"
   - Chassis Number: "TEST2026001"
   - Battery: "4.8 kWh"
   - Year: "2024"
   - Purchase Price: "3500000"
   - Loan Amount: "3000000"
   - Interest Rate: "12.5"
   - Loan Term: "24"
   - Monthly Repayment: "140000"
   - Rebate Amount: "500000"
3. Submit application
4. **Expected:** Status = "pending"

### **Step 2: Analyst Review**
**Login:** `analyst1@mfa.rw` / `Analyst2024!`
1. Navigate to "Review Queue"
2. Find the "Test User Full Workflow" application
3. Review and approve
4. **Expected:** Status changes to "manager-review"

### **Step 3: Manager Review**
**Login:** `manager1@mfa.rw` / `Manager2024!`
1. Navigate to "Manager Review Queue"
2. Find the application
3. Review and approve
4. **Expected:** Status changes to "program-manager-review"

### **Step 4: Program Manager Approval**
**Login:** `program.manager@mfa.rw` / `ProgramMgr2024!`
1. Navigate to "Pending Approvals"
2. Find the application
3. Approve
4. **Expected:** Status changes to "approved-pending-lease"

### **Step 5: Upload Signed Lease**
**Login:** `admin@equitybank.rw` / `Equity2024!`
1. Navigate to "Applications"
2. Filter: "Approved - Pending Lease"
3. Click on the application
4. Click "Upload Signed Lease"
5. Upload any PDF file
6. Submit
7. **Expected:** Status changes to "lease-review"

### **Step 6: Lease Review**
**Login:** `manager1@mfa.rw` / `Manager2024!`
1. Navigate to "Lease Review"
2. Find the application
3. Click "Review Lease"
4. Approve lease
5. **Expected:** Status changes to "pending-payment"

### **Step 7: Process Payment**
**Login:** `finance1@mfa.rw` / `Finance2024!`
1. Navigate to "Pending Payments"
2. Find the application
3. Click "Process Payment"
4. Enter reference: "PAY-TEST-2026-001"
5. Confirm payment
6. **Expected:** Status changes to "payment-complete"

### **Step 8: Verify Completion**
**Login:** `admin@equitybank.rw` / `Equity2024!`
1. Navigate to "Applications"
2. Filter: "Payment Complete"
3. **Verify:** Your test application is now completed
4. **Check:** All timeline events are recorded

---

## **✅ VERIFICATION CHECKLIST**

### **User Access & Menus**
- [ ] Asset Financier sees correct 7 menu items
- [ ] Rebate Analyst sees correct 4 menu items
- [ ] Rebate Manager sees correct 5 menu items (including Lease Review)
- [ ] E-Moto Program Manager sees correct 4 menu items
- [ ] Designated Finance Officer sees correct 4 menu items
- [ ] M&E Team sees correct 4 menu items (view-only)
- [ ] System Admin sees correct 10 menu items

### **Workflow Stages**
- [ ] Asset Financier can submit applications
- [ ] Rebate Analyst can review and approve (Level 1)
- [ ] Rebate Manager can review and approve (Level 2)
- [ ] E-Moto Program Manager can approve (Level 3)
- [ ] Application status changes to "approved-pending-lease"
- [ ] Asset Financier sees "Upload Signed Lease" button
- [ ] Asset Financier can upload lease (status → "lease-review")
- [ ] Rebate Manager has "Lease Review" menu item
- [ ] Rebate Manager can approve/reject leases
- [ ] Approved lease moves to "pending-payment"
- [ ] Finance Officer can process payment
- [ ] Final status is "payment-complete"

### **Seed Data Verification**
- [ ] Bank of Kigali has 3 applications in "approved-pending-lease"
- [ ] At least 1 application in "lease-review"
- [ ] At least 1 application in "pending-payment"
- [ ] At least 1 application in "payment-complete"
- [ ] Applications in "manager-review" status
- [ ] Applications in "program-manager-review" status
- [ ] Applications in "under-review" status
- [ ] Applications in "assigned" status

### **UI Components**
- [ ] Lease upload modal displays correctly
- [ ] Lease review modal displays correctly
- [ ] Payment processing modal displays correctly
- [ ] Toast notifications appear for all actions
- [ ] Application status badges show correct colors
- [ ] Application details display all fields
- [ ] Filters work correctly

---

## **🐛 COMMON ISSUES & SOLUTIONS**

### **Issue: No applications in "Approved - Pending Lease"**
**Solution:**
1. Reseed the database (click "Seed Demo Data" button)
2. Login again
3. Check filters are set correctly

### **Issue: "Upload Signed Lease" button not visible**
**Solution:**
1. Verify application status is exactly "approved-pending-lease"
2. Verify you're logged in as the correct Asset Financier
3. Hard refresh the page (Ctrl+Shift+R)

### **Issue: "Lease Review" menu item missing for Rebate Manager**
**Solution:**
1. Verify you're logged in as `manager1@mfa.rw` or `manager2@mfa.rw`
2. Check user role is exactly "REBATE_MANAGER"
3. Reseed database if role is incorrect

### **Issue: Finance Officer can't see "Pending Payments"**
**Solution:**
1. Verify you're logged in as `finance1@mfa.rw`
2. Verify role is "DESIGNATED_FINANCE_OFFICER"
3. Check that applications have status "pending-payment"

### **Issue: Modal doesn't close after action**
**Solution:**
1. Click the X button in top-right
2. Press ESC key
3. Click outside the modal (on the overlay)
4. Hard refresh if stuck

---

## **📊 EXPECTED TEST DATA COUNT**

After seeding, you should have:

| Status | Count | Visible To |
|--------|-------|------------|
| `pending` | 2+ | Admin, Asset Financiers |
| `assigned` | 3+ | Admin, Assigned Analyst |
| `under-review` | 3+ | Admin, Assigned Analyst |
| `manager-review` | 2+ | Admin, Rebate Managers |
| `program-manager-review` | 2+ | Admin, Program Manager |
| **`approved-pending-lease`** | **3+** | **Admin, Asset Financiers** |
| **`lease-review`** | **1+** | **Admin, Rebate Managers** |
| **`pending-payment`** | **1+** | **Admin, Finance Officers** |
| **`payment-complete`** | **1+** | **Admin, All Users** |

---

## **🎯 SUCCESS CRITERIA**

The system is working correctly if:

✅ All user roles can login successfully  
✅ Each role sees only their designated menu items  
✅ Applications progress through all 4 approval levels  
✅ Post-approval workflow executes correctly:
  - Asset Financiers can upload leases after approval
  - Rebate Managers can review leases via dedicated menu
  - Finance Officers can process payments  
✅ Application statuses update correctly at each stage  
✅ Toast notifications appear for all actions  
✅ Seed data populates all workflow stages  
✅ UI components (modals, buttons) render properly  
✅ Filters work correctly in all views  
✅ End-to-end workflow completes without errors  

---

## **📝 NOTES**

- **File uploads are simulated** - no actual file storage occurs
- **All timestamps are generated** during seeding
- **Payment references** are auto-generated during seed
- **System uses UTC timezone** for all dates
- **Mobile responsiveness** should be tested separately
- **Toast notifications auto-dismiss** after 3-5 seconds

---

**Last Updated:** February 25, 2026  
**System Version:** v2.0 (4-Level Approval with Post-Approval Workflow)  
**Workflow Stages:** 8 (Submission → Analyst → Manager → Program Manager → Approval → Lease Upload → Lease Review → Payment Processing → Complete)