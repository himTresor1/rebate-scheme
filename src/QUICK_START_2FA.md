# 🚀 2FA Quick Start Guide

## TL;DR

**2FA is now ACTIVE!** Use any 6-digit code (like `123456`) to complete login.

---

## ⚡ Quick Test (30 seconds)

1. **Login:** admin@mfa.gov / admin123
2. **Choose:** Email or SMS
3. **Enter:** 123456
4. **Done!** ✅

---

## 🔑 All Test Codes That Work

Pick ANY of these (or make up your own 6 digits):

```
123456  ← Most common
111111  ← All ones
999999  ← All nines
000000  ← All zeros
654321  ← Reverse
123123  ← Pattern
456789  ← Sequence
```

**Pro tip:** Literally ANY 6-digit number works in demo mode!

---

## 📱 What You'll See

### Step 1: Login
```
┌────────────────────────┐
│   Sign In              │
│                        │
│ Email: [____________]  │
│ Password: [________]   │
│                        │
│   [    Sign In    ]    │
│                        │
│ Register as Asset      │
│ Financier →            │
└────────────────────────┘
```

### Step 2: Choose Method
```
┌────────────────────────────────┐
│ Two-Factor Authentication      │
│                                │
│ ┌──────────────────────────┐  │
│ │ 📱 SMS Text Message      │  │
│ │ +1-555-0000              │  │
│ └──────────────────────────┘  │
│                                │
│ ┌──────────────────────────┐  │
│ │ 📧 Email                 │  │
│ │ admin@mfa.gov            │  │
│ └──────────────────────────┘  │
└────────────────────────────────┘
```

### Step 3: Enter Code
```
┌────────────────────────────────┐
│ Enter Verification Code        │
│                                │
│ We've sent a code to:          │
│ admin@mfa.gov                  │
│                                │
│ 🔓 Demo Mode: Enter any        │
│    6-digit code (e.g. 123456)  │
│                                │
│  [1] [2] [3] [4] [5] [6]      │
│                                │
│  ⏱️ Code expires in 10:00     │
│                                │
│   [    Verify Code    ]        │
└────────────────────────────────┘
```

---

## 🎯 Common Questions

### Q: What code do I enter?
**A:** Any 6 digits! Try `123456`

### Q: Where do I get the code?
**A:** Nowhere! In demo mode, make one up. `123456` works great.

### Q: Does it matter if I choose SMS or Email?
**A:** Nope! Both work the same in demo mode.

### Q: Can I use letters?
**A:** No, only digits (0-9). Must be exactly 6 digits.

### Q: What if I enter the wrong code?
**A:** In demo mode, any 6-digit code is "correct"! Can't fail.

### Q: How do I skip 2FA?
**A:** You can't skip it - but any code works, so it's fast!

---

## 🔧 Quick Settings

### To Disable 2FA Temporarily:
**File:** `/App.tsx` line 58

```tsx
// Change from:
<AuthWrapper onSuccess={checkAuth} />

// To:
<AuthForm onSuccess={checkAuth} />
```

### To Enable Real OTP Validation:
**File:** `/supabase/functions/server/index.tsx`

```tsx
// Line ~2038 and ~2090
const isDemoMode = false; // Change true to false
```

---

## 👥 Test Accounts

All use 2FA now:

| Email | Password | Role |
|-------|----------|------|
| admin@mfa.gov | admin123 | System Admin |
| analyst@mfa.gov | analyst123 | Analyst |
| qa@mfa.gov | qa123 | QA Team |
| cfo@mfa.gov | cfo123 | CFO |
| emoto1@company.com | emoto123 | E-Moto Co. |

**After login:** Choose method → Enter `123456` → ✅ Done!

---

## 🎨 Demo Mode Indicator

You'll see this blue banner:
```
┌────────────────────────────────────┐
│ 🔓 Demo Mode: Enter any 6-digit   │
│    code (e.g., 123456)             │
└────────────────────────────────────┘
```

This tells you ANY code will work!

---

## ⚡ Power User Tips

### 1. Paste Support
Copy `123456` and paste directly → Auto-submits!

### 2. Auto-Submit
Type 6 digits → Automatically verifies (no button click)

### 3. Resend Code
Click "Resend" → Get new code (or just use `123456` again)

### 4. Timer Expired?
Just click resend and enter `123456` again

### 5. Console Logs
Open DevTools Console to see:
```
🔓 [DEMO MODE] Accepting any 6-digit code for user xyz
```

---

## 🐛 Troubleshooting

### "Invalid code" error?
→ Make sure you entered EXACTLY 6 digits (no spaces)

### Can't see OTP screen?
→ Sign out first, then sign in again

### Stuck on timer?
→ Click "Resend Code" button

### Need to bypass completely?
→ Edit `/App.tsx` to use `<AuthForm>` instead of `<AuthWrapper>`

---

## 📋 Checklist

Before testing, make sure:

- [ ] You're signed out (refresh page if needed)
- [ ] App is running
- [ ] You have a test account email/password
- [ ] You know to use `123456` as the OTP code

Then:

- [ ] Login with credentials
- [ ] Choose SMS or Email method
- [ ] See the blue "Demo Mode" banner
- [ ] Enter `123456`
- [ ] See the dashboard load ✅

---

## 🎉 That's It!

**You're ready to test 2FA!**

Remember: In demo mode, **ANY 6-digit code = Success** 🎊

---

## 📚 More Info

- Full details: `/2FA_ACTIVATION_SUMMARY.md`
- Demo mode guide: `/OTP_DEMO_MODE.md`
- Ask if you need help!

---

**Last Updated:** December 15, 2024  
**Status:** ✅ Fully Operational  
**Demo Mode:** 🔓 Enabled
