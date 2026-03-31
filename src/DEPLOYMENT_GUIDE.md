# 🚀 Deployment Guide - Supabase Edge Function

## ⚠️ Current Issue

The "Failed to fetch" error occurs because the **Supabase Edge Function** is not deployed. The seed data button is trying to call:

```
https://cwiopwupujshcdadhvve.supabase.co/functions/v1/make-server-324f6e20/seed-data
```

But this endpoint doesn't exist yet because the edge function hasn't been deployed.

---

## 📋 Solution: Deploy the Edge Function

### Option 1: Deploy via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Login to your account
   - Select project: `cwiopwupujshcdadhvve`

2. **Navigate to Edge Functions:**
   - Click "Edge Functions" in the left sidebar
   - Click "Deploy new function"

3. **Deploy the Function:**
   - **Function Name:** `server` (must be exactly "server")
   - **Source Code:** Copy all files from `/supabase/functions/server/` directory
   - Required files:
     - `index.tsx` (main entry point)
     - `kv_store.tsx` (database utilities)
     - `otp_service.tsx` (OTP management)
     - `seed.tsx` (seed data logic)
   
4. **Configure Environment Variables:**
   The following secrets are already configured:
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `SUPABASE_DB_URL`

5. **Deploy:**
   - Click "Deploy function"
   - Wait for deployment to complete (~1-2 minutes)

6. **Verify Deployment:**
   - Test the health endpoint:
     ```
     https://cwiopwupujshcdadhvve.supabase.co/functions/v1/make-server-324f6e20/health
     ```
   - Should return: `{"status":"ok"}`

---

### Option 2: Deploy via Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref cwiopwupujshcdadhvve

# Deploy the function
supabase functions deploy server --no-verify-jwt

# Test the deployment
curl https://cwiopwupujshcdadhvve.supabase.co/functions/v1/make-server-324f6e20/health
```

---

## ✅ After Deployment

Once the edge function is deployed:

1. **Refresh the login page** in your Figma Make preview
2. **Click "Seed Demo Data"** button (bottom-left corner)
3. The button will:
   - ✅ Perform a health check
   - ✅ Delete all existing data
   - ✅ Create 17+ demo users
   - ✅ Create 18+ applications across all workflow stages
   - ✅ Create 4 Asset Financier organizations
   - ✅ Show success message with login credentials

4. **Login with demo credentials:**
   - Admin: `admin@mfa.rw` / `Admin2024!`
   - Analyst: `analyst1@mfa.rw` / `Analyst2024!`
   - QA: `qa1@mfa.rw` / `QA2024!`
   - Manager: `manager@mfa.rw` / `Manager2024!`
   - Financier: `admin@bankofkigali.rw` / `BoK2024!`

---

## 🔍 Troubleshooting

### Issue: "Failed to fetch" persists

**Check:**
1. Edge function is deployed with name **exactly** `server`
2. Function is in "Active" state (not "Paused")
3. No CORS errors in browser console
4. Supabase project is active (not paused)

**Debug:**
```javascript
// Open browser console (F12) and run:
fetch('https://cwiopwupujshcdadhvve.supabase.co/functions/v1/make-server-324f6e20/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Issue: Health check returns 404

The function is not deployed or deployed with wrong name.
- Function name MUST be: `server`
- Check Supabase Dashboard → Edge Functions

### Issue: Health check returns 500

There's an error in the server code.
- Check Edge Function logs in Supabase Dashboard
- Look for startup errors in the logs

---

## 📁 File Structure Reference

Your edge function should have this structure in Supabase:

```
Edge Functions
└── server/
    ├── index.tsx          (3926 lines - main server with all routes)
    ├── kv_store.tsx       (protected - KV database utilities)
    ├── otp_service.tsx    (OTP generation and validation)
    └── seed.tsx           (1677 lines - comprehensive seed data)
```

---

## 🎯 What the Edge Function Does

Once deployed, the `server` edge function provides:

### Authentication Routes
- `POST /make-server-324f6e20/signup` - User registration
- `POST /make-server-324f6e20/auth/request-otp` - Send OTP for MFA
- `POST /make-server-324f6e20/auth/verify-otp` - Verify OTP code
- `POST /make-server-324f6e20/auth/update-credentials` - Update password

### Application Management
- `GET /make-server-324f6e20/applications` - List applications
- `POST /make-server-324f6e20/applications` - Submit new application
- `PUT /make-server-324f6e20/applications/:id` - Update application
- `POST /make-server-324f6e20/applications/:id/assign` - Assign to analyst

### Review & Approval
- `POST /make-server-324f6e20/applications/:id/analyst-review` - Analyst evaluation
- `POST /make-server-324f6e20/applications/:id/qa-review` - QA evaluation
- `POST /make-server-324f6e20/applications/:id/cfo-review` - CFO approval

### Finance Workflow (Two-Signature)
- `POST /make-server-324f6e20/finance/initiate-payment` - First signature
- `POST /make-server-324f6e20/finance/authorize-payment` - Second signature
- `GET /make-server-324f6e20/disbursements` - Payment history

### Asset Financier
- `POST /make-server-324f6e20/asset-financiers/register` - Registration
- `GET /make-server-324f6e20/asset-financiers/:id/bank-details` - Bank info
- `POST /make-server-324f6e20/asset-financiers/:id/staff` - Staff management

### Admin & System
- `GET /make-server-324f6e20/users` - User management
- `GET /make-server-324f6e20/roles` - RBAC roles
- `GET /make-server-324f6e20/criteria` - Eligibility criteria
- `POST /make-server-324f6e20/seed-data` - **Database seeding** ⭐

### Utility
- `GET /make-server-324f6e20/health` - Health check

---

## 💡 Alternative: Use Fallback Mode

If you **cannot deploy** the edge function right now, the seed button will automatically:

1. Detect that the server is unavailable
2. Show a warning message
3. Display the demo credentials that **would** be created
4. Provide deployment instructions

**You won't be able to actually seed the database**, but you'll see what credentials would exist.

---

## 📞 Need Help?

- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions/deploy
- **CLI Reference:** https://supabase.com/docs/reference/cli/supabase-functions-deploy

---

## ✨ Once Everything is Working

After successful deployment and seeding, you'll have:

- ✅ 17+ demo users across all roles
- ✅ 18+ applications at every workflow stage
- ✅ 4 Asset Financier organizations
- ✅ Complete finance workflow with signatures
- ✅ Clarification loop examples
- ✅ Side-by-side score comparisons
- ✅ Full audit trail
- ✅ 100% mobile responsive interface

**Enjoy testing the comprehensive Rebate Scheme System! 🎉**
