# 🔐 How to Login - Quick Start Guide

## ⚠️ IMPORTANT: You're getting "Invalid login credentials" error?

This means **the database hasn't been seeded yet**. Follow these steps:

---

## 🚀 Step 1: Seed the Database (REQUIRED - First Time Only)

1. **Look at the bottom-left corner** of the login screen
2. You'll see a green button that says **"🎯 Seed Demo Data"**
3. **Click it!**
4. Confirm the action when prompted
5. **Wait 30-60 seconds** for the seeding to complete
6. You'll see a success message with login credentials

![Seed Button Location: Bottom-left corner of the login screen]

---

## ✅ Step 2: Login with Demo Credentials

After seeding is complete, you can login with any of these accounts:

### 🏛️ MFA Internal Staff

**System Admin:**
- Email: `admin@mfa.rw`
- Password: `Admin2024!`

**Rebate Analyst:**
- Email: `analyst1@mfa.rw`
- Password: `Analyst2024!`

**Rebate Manager:**
- Email: `manager1@mfa.rw`
- Password: `Manager2024!`

**Program Manager:**
- Email: `program.manager@mfa.rw`
- Password: `ProgramMgr2024!`

**Finance Officer:**
- Email: `finance1@mfa.rw`
- Password: `Finance2024!`

### 🏦 Asset Financiers (Banks)

**Bank of Kigali:**
- Email: `admin@bankofkigali.rw`
- Password: `BoK2024!`

**Equity Bank Rwanda:**
- Email: `admin@equitybank.rw`
- Password: `Equity2024!`

**Vision Finance Company:**
- Email: `admin@visionfinance.rw`
- Password: `Vision2024!`

---

## 🔍 Troubleshooting

### Error: "Invalid login credentials"
**Solution:** Click the "Seed Demo Data" button first (bottom-left corner)

### Error: "Failed to seed data"
**Possible causes:**
1. **Server not deployed yet** - The Supabase Edge Function needs to be deployed
2. **Network issue** - Check your internet connection
3. **Supabase project issue** - Make sure your Supabase project is active

**What to do:**
- Check the browser console (F12) for detailed error messages
- Make sure you're connected to the internet
- Wait a few seconds and try clicking "Seed Demo Data" again

### Error: "Edge Function not deployed"
**Solution:** 
- The backend server needs to be deployed to Supabase
- Contact your system administrator or check the deployment guide

---

## 🎯 Quick Test Workflow

Want to test the complete workflow? Use these accounts in order:

1. **Submit Application**
   - Login: `admin@bankofkigali.rw` / `BoK2024!`
   - Go to "Submit Application"

2. **Analyst Review**
   - Login: `analyst1@mfa.rw` / `Analyst2024!`
   - Review and approve the application

3. **Manager Review**
   - Login: `manager1@mfa.rw` / `Manager2024!`
   - Second-level approval

4. **Program Manager Approval**
   - Login: `program.manager@mfa.rw` / `ProgramMgr2024!`
   - Final approval before lease

5. **Upload Signed Lease**
   - Login: `admin@bankofkigali.rw` / `BoK2024!`
   - Upload the signed lease document

6. **Manager Lease Review**
   - Login: `manager1@mfa.rw` / `Manager2024!`
   - Review and approve the lease

7. **Finance Officer Payment**
   - Login: `finance1@mfa.rw` / `Finance2024!`
   - Process the payment

---

## 💡 Pro Tips

1. **Use Incognito/Private Windows** - Open separate browser windows for different roles to test workflow transitions

2. **Password Pattern** - All passwords follow the pattern: `[Identifier]2024!`
   - Admin2024!
   - Analyst2024!
   - Manager2024!
   - BoK2024! (Bank of Kigali)
   - Equity2024!
   - etc.

3. **First Time?** - Always seed the database first before trying to login

4. **Need to Reset?** - Click "Seed Demo Data" again to reset all data and start fresh

---

## 📞 Need Help?

- Check `/CREDENTIALS.md` for complete list of all 17 test accounts
- Check `/TEST_GUIDELINE.md` for detailed testing instructions
- Open browser console (F12) to see detailed error messages

---

**Remember:** The "Seed Demo Data" button (bottom-left) is your friend! Click it first! 🎯
