# 🌱 How to Seed the Database - COMPLETE GUIDE

## Problem
Getting "**Invalid login credentials**" error when trying to login.

## Solution
You need to seed (populate) the database with demo users and data first!

---

## ✅ **METHOD 1: Use the Seed Button on Login Page** (EASIEST)

### Steps:
1. **Go to the login page** (you should already be there)
2. **Look at the BOTTOM LEFT corner** of the screen
3. **Click the "Seed Demo Data" button** (small gray button with database icon)
4. **Confirm** when prompted
5. **Wait 30-60 seconds** for the seeding to complete
6. **You'll see a success message** with counts of created data
7. **Now you can login!**

---

## ✅ **METHOD 2: Open seed.html in Browser**

### Steps:
1. **Navigate to**: `http://localhost:5173/seed.html` (or your app URL + /seed.html)
2. **Click the big green "🚀 Seed Database Now" button**
3. **Wait for completion** (you'll see a loading spinner)
4. **Success!** You'll see statistics of created data
5. **Go back to login page** and use the credentials below

---

## ✅ **METHOD 3: Direct API Call** (Developer Method)

### Using cURL:
```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-324f6e20/seed-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Using JavaScript Console:
```javascript
// Open browser console (F12) on login page and run:
const { projectId, publicAnonKey } = await import('./utils/supabase/info.js');

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20/seed-data`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);

const result = await response.json();
console.log('Seed result:', result);
```

---

## 🔐 Login Credentials (After Seeding)

Once seeded, use these credentials to login:

### **Internal MFA Staff**

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **System Admin** | admin@mfa.rw | Admin2024! | Full system access |
| **Rebate Analyst** | analyst1@mfa.rw | Analyst2024! | Reviews applications |
| **Rebate Analyst 2** | analyst2@mfa.rw | Analyst2024! | Additional analyst |
| **QA Team** | qa1@mfa.rw | QA2024! | Quality assurance |
| **CFO/Manager** | manager@mfa.rw | Manager2024! | Final approvals |
| **Finance Officer** | finance@mfa.rw | Finance2024! | Disbursements |
| **M&E Officer** | monitoring@mfa.rw | Monitor2024! | Monitoring & evaluation |

### **Asset Financiers (Banks & MFIs)**

| Organization | Email | Password |
|--------------|-------|----------|
| **Bank of Kigali** | admin@bankofkigali.rw | BoK2024! |
| **Equity Bank Rwanda** | admin@equitybank.rw | Equity2024! |
| **Vision Finance Company** | admin@visionfinance.rw | Vision2024! |
| **Umurenge SACCO** | admin@umurenge.rw | Umurenge2024! |

### **E-Moto Companies (Claims Officers)**

| Company | Email | Password |
|---------|-------|----------|
| **Ampersand Rwanda** | claims@ampersand.rw | Ampersand2024! |
| **EV Electric Rwanda** | claims@evelectric.rw | EV2024! |
| **Opibus Rwanda** | claims@opibus.rw | Opibus2024! |

---

## 📊 What Gets Created During Seeding?

When you seed the database, here's what gets created:

### **System Configuration**
- ✅ **38 Permissions** (granular access controls)
- ✅ **9 Roles** (System Admin, Analyst, QA, CFO, etc.)
- ✅ **12 Eligibility Criteria** (for application evaluation)

### **Users & Organizations**
- ✅ **13 Users** (7 MFA staff + 4 Asset Financiers + 2 Claims Officers)
- ✅ **4 Organizations** (banks, MFIs, e-moto companies)
- ✅ **4 Bank Account Configurations** (for disbursements)
- ✅ **8 Staff Members** (2 per organization)

### **Applications & Workflow**
- ✅ **18 Applications** across all organizations
  - 8 from Bank of Kigali (all workflow stages)
  - 4 from Equity Bank Rwanda
  - 3 from Vision Finance Company
  - 3 from Umurenge SACCO

### **Applications by Status**
- **PENDING**: 3 applications (awaiting assignment)
- **ASSIGNED**: 2 applications (assigned to analysts)
- **UNDER-REVIEW**: 3 applications (being reviewed)
- **QA-REVIEW**: 2 applications (QA validation)
- **CFO-APPROVAL**: 2 applications (final approval)
- **APPROVED**: 3 applications (approved for disbursement)
- **DISBURSED**: 2 applications (rebate paid)
- **REJECTED**: 1 application (with reason)
- **INFO-REQUESTED**: 1 application (needs more info)

### **Evaluations & Disbursements**
- ✅ **Evaluations** for all reviewed applications
- ✅ **Disbursement Records** for approved applications

---

## 🐛 Troubleshooting

### Issue: "Seed Demo Data" button not visible
**Solution**: Make sure you're on the login page. The button is at the bottom left corner in a light gray color.

### Issue: Seeding takes too long
**Solution**: Normal! Creating 13 auth users + all data takes 30-60 seconds. Be patient.

### Issue: Seed button shows error
**Solutions**:
1. Check browser console (F12) for detailed error
2. Make sure your Supabase project is running
3. Check internet connection
4. Try refreshing the page and trying again

### Issue: Still can't login after seeding
**Solutions**:
1. **Wait 10 seconds** after seeding completes
2. Try a **hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Clear browser cache** and try again
4. **Verify** the seeding was successful (should see success message with counts)
5. **Double-check** you're using the exact credentials from above (copy-paste)

### Issue: "User already exists" error during seeding
**Solution**: This means data is already seeded! Just try logging in with the credentials above.

---

## ⚠️ Important Notes

### **WARNING: Seeding DELETES ALL EXISTING DATA**
The seed operation:
- ❌ Deletes all existing users
- ❌ Deletes all existing applications
- ❌ Deletes all existing organizations
- ✅ Creates fresh demo data

**Only run seeding when:**
- First setting up the system
- After resetting the database
- When you want to start with clean demo data

### **After Seeding**
1. All users are created in Supabase Auth
2. Email verification is automatically confirmed
3. Passwords are the ones listed above
4. Users can login immediately (no OTP for initial login in demo)

---

## ✅ Verification Checklist

After seeding, verify everything worked:

- [ ] Seeding completed without errors
- [ ] Success message showed user counts
- [ ] Can login as System Admin (admin@mfa.rw)
- [ ] Can login as Analyst (analyst1@mfa.rw)
- [ ] Can login as Bank of Kigali (admin@bankofkigali.rw)
- [ ] Dashboard loads for each role
- [ ] Applications are visible

---

## 🎉 Success!

If seeding completed successfully, you should now be able to:
1. **Login with any of the credentials above**
2. **See the appropriate dashboard** for each role
3. **View applications** at various workflow stages
4. **Test the complete rebate workflow**
5. **Demonstrate all features** to your boss!

---

**Need Help?**
- Check browser console (F12) for errors
- Look at the network tab to see API responses
- Verify Supabase project is running
- Make sure you're using the correct credentials (case-sensitive!)

**Last Updated**: December 17, 2024
