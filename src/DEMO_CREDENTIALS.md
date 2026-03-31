# 🎯 Demo System Credentials & Test Data

## ⚠️ IMPORTANT: First-Time Setup Required

**If you see "Failed to fetch" error when clicking "Seed Demo Data":**

The Supabase Edge Function needs to be deployed first. See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed instructions.

**Quick Fix:**
1. Go to https://supabase.com/dashboard
2. Select project: `cwiopwupujshcdadhvve`
3. Deploy "Edge Functions" → "server" function
4. Copy files from `/supabase/functions/server/` directory
5. Return here and click "Seed Demo Data" button

---

## 📋 Quick Start Guide

**First Time Setup:**
1. **Deploy the edge function** (see note above)
2. Click the **"Seed Demo Data"** button on the login screen (bottom-left corner)
3. Wait 30-60 seconds for seeding to complete
4. Login with any of the credentials below

---

## 👥 Demo User Accounts

### MFA Internal Staff

#### System Administrator
- **Email:** `admin@mfa.rw`
- **Password:** `Admin2024!`
- **Role:** System Administrator
- **Access:** Full system access, user management, RBAC configuration

#### Rebate Analysts
- **Email:** `analyst1@mfa.rw` | **Password:** `Analyst2024!`
- **Email:** `analyst2@mfa.rw` | **Password:** `Analyst2024!`
- **Role:** Rebate Analyst
- **Access:** Review applications, perform NIDA/RURA verification, request clarifications

#### QA Team
- **Email:** `qa1@mfa.rw` | **Password:** `QA2024!`
- **Role:** QA Team
- **Access:** Quality assurance review, second-level approval

#### Finance Officers
- **Email:** `finance1@mfa.rw` | **Password:** `Finance2024!`
- **Email:** `finance2@mfa.rw` | **Password:** `Finance2024!`
- **Role:** Finance Officer
- **Access:** Initiate payment disbursements (first signature)

#### Rebate Manager (CFO)
- **Email:** `manager@mfa.rw` | **Password:** `Manager2024!`
- **Role:** Rebate Manager / CFO
- **Access:** Final approval, authorize payments (second signature), analytics

#### M&E Officer
- **Email:** `monitoring@mfa.rw` | **Password:** `Monitor2024!`
- **Role:** Monitoring & Evaluation
- **Access:** View reports, analytics, export data

---

### Asset Financiers (Banks & MFIs)

#### Bank of Kigali
- **Email:** `admin@bankofkigali.rw`
- **Password:** `BoK2024!`
- **Organization:** Bank of Kigali
- **Applications:** 9 applications across all statuses

#### Equity Bank Rwanda
- **Email:** `admin@equitybank.rw`
- **Password:** `Equity2024!`
- **Organization:** Equity Bank Rwanda
- **Applications:** 3 applications

#### Vision Finance Company
- **Email:** `admin@visionfinance.rw`
- **Password:** `Vision2024!`
- **Organization:** Vision Finance Company
- **Applications:** 3 applications

#### Umurenge SACCO
- **Email:** `admin@umurenge.rw`
- **Password:** `Umurenge2024!`
- **Organization:** Umurenge SACCO
- **Applications:** 3 applications

---

## 📊 Test Data Overview

### Applications (18 Total)
Applications are distributed across all workflow stages:

| Status | Count | Description |
|--------|-------|-------------|
| `pending` | 2 | Newly submitted, awaiting assignment |
| `assigned` | 2 | Assigned to analyst |
| `under-review` | 2 | Analyst actively reviewing |
| `qa-review` | 2 | With QA team for review |
| `cfo-approval` | 1 | Awaiting CFO final approval |
| `qa-approved` | 1 | QA approved, ready for finance workflow |
| `awaiting-final-approval` | 1 | Finance Officer initiated, awaiting Manager approval |
| `approved-for-payment` | 1 | Both signatures complete, ready for disbursement |
| `approved` | 3 | Fully approved applications |
| `disbursed` | 1 | Payment disbursed |
| `info-requested` | 1 | Clarification requested from financier |
| `rejected` | 1 | Rejected application |

### Organizations (4)
- Bank of Kigali (BANK)
- Equity Bank Rwanda (BANK)
- Vision Finance Company (MFI)
- Umurenge SACCO (MFI)

### Eligibility Criteria (12)
Criteria assigned to different approval levels:
- **ANALYST:** 5 criteria
- **QA:** 3 criteria
- **CFO:** 2 criteria
- **ALL:** 2 criteria

---

## 🧪 Testing Workflows

### 1. Analyst Review Flow
**Login:** `analyst1@mfa.rw` / `Analyst2024!`

**What to test:**
- View applications in "Analyst Queue" tab
- See 3-level navigation: Asset Financiers → Applications → Review
- Click on "Bank of Kigali" card
- Select an application in `assigned` or `under-review` status
- On **mobile**: Click floating "Review" button (bottom-right)
- Mark eligibility criteria YES/NO
- Add review notes
- **Actions:** Approve, Reject, or Request Clarification

**Clarification Feature:**
- Click "Ask for Clarification" button
- Enter message requesting additional info
- Application goes to `info-requested` status
- Asset Financier sees the request in their dashboard

### 2. QA Review Flow
**Login:** `qa1@mfa.rw` / `QA2024!`

**What to test:**
- View applications in "QA Queue" tab
- Review applications in `qa-review` status
- See separate QA criteria checklist
- Compare QA evaluation vs Analyst evaluation (if discrepancies exist)
- Approve or send back to analyst

### 3. CFO Approval Flow
**Login:** `manager@mfa.rw` / `Manager2024!`

**What to test:**
- View applications in "CFO Queue" tab
- See side-by-side score comparison (Analyst vs QA)
- View discrepancies highlighted in red
- Review CFO-specific criteria
- Final approval decision

### 4. Two-Signature Finance Workflow
**Step 1 - First Signature (Finance Officer):**
- **Login:** `finance1@mfa.rw` / `Finance2024!`
- Go to "Payment Initiation" tab
- Find applications in `qa-approved` status
- Click "Initiate Payment" on an application
- Application moves to `awaiting-final-approval`

**Step 2 - Second Signature (Manager):**
- **Login:** `manager@mfa.rw` / `Manager2024!`
- Go to "Payment Authorization" tab
- Find applications in `awaiting-final-approval` status
- Review initiation details (who initiated, when)
- Click "Authorize Payment"
- Application moves to `approved-for-payment`

**Step 3 - Disbursement:**
- Application ready for payment processing
- Can mark as `disbursed` when payment confirmed

### 5. Asset Financier Dashboard
**Login:** `admin@bankofkigali.rw` / `BoK2024!`

**What to test:**
- View all submitted applications
- Submit new applications
- Upload documents
- Respond to information requests (if any in `info-requested`)
- View payment history
- Manage bank account details
- Invite/manage staff members

### 6. Mobile Responsiveness
**Test on mobile (<1024px width):**
- Tabs stack vertically instead of horizontally
- Asset Financier cards are wider (2-column max)
- Application review view:
  - See only application data on first load
  - Floating "Review" button at bottom-right
  - Click Review → Slide-in panel from right
  - Smooth animations and close with X button or overlay

---

## 🎨 Design System

**Primary Color:** `#023F40` (Deep Teal Green)
**Secondary Color:** `#6DB27F` (Approval Green)
**Font:** Poppins (system default)

**Status Badge Colors:**
- 🟢 Green: Approved, Disbursed
- 🔵 Blue: Under Review, QA Review
- 🟡 Yellow: Pending, Info Requested
- 🟠 Orange: CFO Approval, Awaiting Signatures
- 🔴 Red: Rejected

---

## 🔐 Security Features

- **Multi-Factor Authentication (MFA):** All users must verify via SMS or Email OTP after login
- **Role-Based Access Control (RBAC):** Granular permissions per role
- **Two-Signature Approval:** Dual approval required for payments (Finance Officer + Manager)
- **Audit Trail:** Complete history of all actions and decisions
- **Session Management:** Auto-logout on token expiry

---

## 💡 Pro Tips

1. **First time?** Start with the Seed Demo Data button on the login screen
2. **Testing mobile?** Use Chrome DevTools (F12) and toggle device toolbar (Ctrl+Shift+M)
3. **Lost credentials?** Check this file or reseed the database
4. **Need more data?** The seed function can be modified in `/supabase/functions/server/seed.tsx`
5. **Inspecting data?** Login as admin and use the System Admin dashboard

---

## 📞 Support

For issues or questions:
- Check browser console for error logs
- Verify Supabase edge function is deployed
- Ensure network connectivity
- Re-run the seed function if data is corrupted