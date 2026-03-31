# 🏦 Rebate Scheme Management System

A comprehensive web application for managing electric motorcycle rebate applications with multi-level approval workflows, role-based access control, and two-signature payment authorization.

---

## 🚀 Quick Start

### 1. **Deploy the Backend** (Required First Step)

⚠️ **The "Seed Demo Data" button will not work until you deploy the Supabase Edge Function.**

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed deployment instructions.

**Quick Deploy:**
1. Visit https://supabase.com/dashboard
2. Select project: `cwiopwupujshcdadhvve`
3. Deploy Edge Function named `server`
4. Upload files from `/supabase/functions/server/` directory

### 2. **Seed Demo Data**

After deployment:
1. Open the application login screen
2. Click **"Seed Demo Data"** button (bottom-left corner)
3. Wait 30-60 seconds for database population
4. Login with demo credentials

### 3. **Start Testing**

Login with any demo account from **[DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md)**:
- **Analyst:** `analyst1@mfa.rw` / `Analyst2024!`
- **QA:** `qa1@mfa.rw` / `QA2024!`
- **Manager:** `manager@mfa.rw` / `Manager2024!`
- **Financier:** `admin@bankofkigali.rw` / `BoK2024!`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | **START HERE** - How to deploy the Supabase Edge Function |
| [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md) | All demo user credentials and testing workflows |

---

## ✨ Key Features

### 🔐 **Authentication & Security**
- Multi-Factor Authentication (SMS/Email OTP)
- Role-Based Access Control (RBAC) with granular permissions
- Session management with auto-logout
- Password security requirements
- Comprehensive audit trail

### 📝 **Application Management**
- Submit rebate applications
- Upload supporting documents
- Track application status in real-time
- Multi-level approval workflow
- Clarification request system

### 👥 **User Roles**

#### MFA Internal Staff
- **System Administrator** - Full system access, user/role management
- **Rebate Analyst** - Initial application review and verification
- **QA Team** - Quality assurance and second-level review
- **Finance Officer** - Payment initiation (first signature)
- **Rebate Manager (CFO)** - Final approvals and payment authorization (second signature)
- **M&E Officer** - Monitoring, evaluation, and reporting

#### External Users
- **Asset Financier Admin** - Banks/MFIs managing rebate applications
- **Asset Financier Staff** - Limited access for application submission
- **Claims Officer** - E-Moto companies submitting claims

### 🔄 **Approval Workflow**

```
Submit → Assign → Analyst Review → QA Review → CFO Approval 
    ↓
QA Approved → Finance Initiates (1st Signature) → Manager Authorizes (2nd Signature)
    ↓
Approved for Payment → Disbursed
```

**Clarification Loop:**
- Analysts/QA can request additional information
- Application goes to `info-requested` status
- Asset Financier responds through dashboard
- Application returns to review queue

### 💰 **Two-Signature Finance Workflow**
- **First Signature:** Finance Officer initiates payment
- **Second Signature:** Manager/CFO authorizes payment
- Complete audit trail with timestamps and approver details
- Payment history tracking
- Disbursement confirmation

### 📊 **Dynamic Eligibility Criteria**
- Configurable criteria per approval level (ANALYST, QA, CFO, or ALL)
- YES/NO checklist evaluation
- Side-by-side score comparison (Analyst vs QA)
- Discrepancy highlighting for CFO review
- Separate storage for each approval level

### 🏢 **Asset Financier Management**
- Invitation-only registration (admin-controlled)
- Organization profile management
- Bank account details
- Staff member management with granular permissions
- Application tracking dashboard
- Document upload system

### 📱 **Mobile Responsiveness**
- 100% mobile-compatible interface
- Vertical tab stacking on small screens
- Wider Asset Financier cards (2-column max)
- **Revolutionary Mobile Review UX:**
  - Floating "Review" button
  - Slide-in criteria panel from right
  - Smooth animations
  - No overflow issues

---

## 🎨 Design System

- **Primary Color:** `#023F40` (Deep Teal Green)
- **Secondary Color:** `#6DB27F` (Approval Green)
- **Font:** Poppins
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Backend:** Supabase (Auth, Database, Edge Functions, Storage)

---

## 📁 Project Structure

```
/
├── App.tsx                          # Main application entry point
├── components/
│   ├── admin/                       # System Admin dashboard
│   ├── analyst/                     # Analyst dashboard & review
│   ├── qa/                          # QA dashboard & review
│   ├── cfo/                         # CFO dashboard & approval
│   ├── finance/                     # Finance workflow components
│   ├── asset-financier/             # Asset Financier dashboards
│   ├── auth/                        # Authentication components
│   ├── ui/                          # Reusable UI components
│   ├── AuthForm.tsx                 # Login form
│   ├── SeedDataButton.tsx           # Database seeding button
│   └── ...
├── utils/
│   ├── auth.tsx                     # Authentication service
│   ├── clientSeed.tsx               # Client-side seed fallback
│   └── supabase/
│       └── info.tsx                 # Supabase configuration
├── supabase/functions/server/
│   ├── index.tsx                    # Edge function main entry (3926 lines)
│   ├── kv_store.tsx                 # KV database utilities (protected)
│   ├── otp_service.tsx              # OTP management
│   └── seed.tsx                     # Comprehensive seed data (1677 lines)
├── styles/
│   └── globals.css                  # Global styles & Tailwind config
├── DEPLOYMENT_GUIDE.md              # Deployment instructions
├── DEMO_CREDENTIALS.md              # Demo users & testing guide
└── README.md                        # This file
```

---

## 🧪 Test Data (After Seeding)

| Type | Count | Description |
|------|-------|-------------|
| **Users** | 17+ | All roles including analysts, QA, finance, Asset Financiers |
| **Applications** | 18+ | Distributed across all workflow statuses |
| **Organizations** | 4 | Banks and MFIs with bank details |
| **Criteria** | 12 | Eligibility criteria for all approval levels |
| **Evaluations** | 10+ | Analyst and QA evaluations with scores |
| **Disbursements** | 2+ | Payment records with signatures |
| **Staff** | 8+ | Asset Financier staff members |

**Application Status Distribution:**
- `pending`, `assigned`, `under-review`, `qa-review`, `cfo-approval`
- `qa-approved`, `awaiting-final-approval`, `approved-for-payment`
- `approved`, `disbursed`, `info-requested`, `rejected`

---

## 🔧 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **Sonner** for toast notifications
- **Motion/React** for animations

### Backend
- **Supabase Auth** - User authentication with JWT
- **Supabase Database** - PostgreSQL with KV store
- **Supabase Edge Functions** - Deno-based serverless functions
- **Supabase Storage** - Document storage with signed URLs
- **Hono** - Web framework for edge functions

### Security
- Row-Level Security (RLS) policies
- JWT token authentication
- Multi-Factor Authentication (OTP)
- Role-based permissions
- Password hashing (bcrypt)

---

## 🎯 Testing Workflows

See **[DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md)** for detailed testing guides covering:

1. **Analyst Review Flow** - Application assignment, NIDA/RURA verification, clarifications
2. **QA Review Flow** - Quality assurance, second-level approval
3. **CFO Approval Flow** - Side-by-side comparison, final decision
4. **Two-Signature Finance** - Payment initiation and authorization
5. **Asset Financier Dashboard** - Application submission, document upload, responses
6. **Mobile Responsiveness** - Touch-friendly UI, slide-in panels

---

## 🐛 Troubleshooting

### "Failed to fetch" Error

**Problem:** Supabase Edge Function not deployed  
**Solution:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Empty Tables / No Data

**Problem:** Database not seeded  
**Solution:** Click "Seed Demo Data" button after deploying edge function

### Login Fails

**Problem:** User doesn't exist yet  
**Solution:** Seed the database first, then use credentials from DEMO_CREDENTIALS.md

### OTP Not Sending

**Problem:** OTP service requires configured email/SMS provider  
**Note:** System generates codes but email/SMS may not send without provider setup

---

## 📊 Statistics Dashboard

Available for M&E Officers and System Admins:
- Total applications by status
- Approval rates and timelines
- Disbursement tracking
- Organization performance metrics
- Monthly trends and analytics
- Export functionality

---

## 🚦 Application Statuses

| Status | Description | Who Can Act |
|--------|-------------|-------------|
| `pending` | Newly submitted | System Admin |
| `assigned` | Assigned to analyst | Analyst |
| `under-review` | Being reviewed | Analyst |
| `qa-review` | With QA team | QA Team |
| `cfo-approval` | Awaiting CFO decision | CFO/Manager |
| `qa-approved` | Ready for finance | Finance Officer |
| `awaiting-final-approval` | Awaiting 2nd signature | Manager |
| `approved-for-payment` | Ready to disburse | Finance Team |
| `approved` | Fully approved | - |
| `disbursed` | Payment completed | - |
| `info-requested` | Needs clarification | Asset Financier |
| `rejected` | Rejected | - |

---

## 📞 Support & Resources

- **Browser Console:** Press F12 to view detailed error logs
- **Network Tab:** Monitor API calls and responses
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Project ID:** `cwiopwupujshcdadhvve`

---

## ✅ Pre-Deployment Checklist

- [ ] Supabase Edge Function deployed as `server`
- [ ] Health check endpoint returns `{"status":"ok"}`
- [ ] Environment variables configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)
- [ ] Seed data button clicked and completed successfully
- [ ] Can login with demo credentials
- [ ] Applications visible in dashboards
- [ ] Mobile view tested (resize browser < 1024px)

---

## 🎉 You're All Set!

After completing the deployment and seeding:

1. ✅ 17+ demo users ready to test
2. ✅ 18+ applications across all workflow stages
3. ✅ Complete finance workflow with two-signature approval
4. ✅ Mobile-responsive interface
5. ✅ Full RBAC system with granular permissions
6. ✅ MFA security enabled

**Start testing with:** `analyst1@mfa.rw` / `Analyst2024!`

Enjoy exploring the Rebate Scheme Management System! 🚀
