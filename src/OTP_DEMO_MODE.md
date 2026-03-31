# 🔓 OTP Demo Mode - Quick Reference

## Overview
The 2FA system is now in **DEMO MODE**, which means **ANY 6-digit code will work** for OTP verification. This allows you to test the system without needing real SMS/Email services configured.

---

## ✅ How It Works

### Current Behavior:
- ✅ User logs in with email/password
- ✅ 2FA method selection screen appears (SMS or Email)
- ✅ Backend "sends" OTP (console.log only)
- ✅ **ANY 6-digit code (e.g., 123456) will be accepted**
- ✅ User gets access to the system

### Visual Indicators:
- Blue banner on OTP screen: **"🔓 Demo Mode: Enter any 6-digit code"**
- Console logs show: **"🔓 [DEMO MODE] Accepting any 6-digit code"**

---

## 🧪 Testing the Flow

### Quick Test:
```bash
1. Login: admin@mfa.gov / admin123
2. Choose: Email (or SMS - doesn't matter)
3. Enter: 123456 (or any 6 digits)
4. Success! ✅
```

### What You'll See:
```
Step 1: Login Screen
  ↓ [Enter credentials]
  
Step 2: 2FA Method Selection
  ↓ [Choose SMS or Email]
  
Step 3: OTP Verification Screen
  📱 Blue banner: "Demo Mode: Enter any 6-digit code"
  ↓ [Type: 1-2-3-4-5-6]
  
Step 4: Success! Dashboard loads
```

---

## 🎯 Test Cases

### ✅ These Will Work:
- `123456` - Classic test code
- `111111` - All ones
- `999999` - All nines
- `654321` - Reverse order
- **Any combination of 6 digits**

### ❌ These Will NOT Work:
- `12345` - Only 5 digits (needs 6)
- `1234567` - 7 digits (too many)
- `abcdef` - Letters (digits only)
- `12-34-56` - Special characters

---

## 🔧 Backend Configuration

### File: `/supabase/functions/server/index.tsx`

**Line ~2038:** OTP Verification Endpoint
```typescript
const isDemoMode = true; // ← Demo mode enabled
if (isDemoMode && /^\d{6}$/.test(code)) {
  // Accept any 6-digit code
  return success;
}
```

**Line ~2090:** Email Link Verification
```typescript
const isDemoMode = true; // ← Demo mode enabled
if (isDemoMode && /^\d{6}$/.test(code)) {
  // Accept any 6-digit code from email links
  return success;
}
```

---

## 🚀 Switching to Production Mode

When you're ready to use **REAL** SMS/Email services:

### Step 1: Configure API Keys
Add your SendGrid/Twilio credentials to environment variables

### Step 2: Update Backend
In `/supabase/functions/server/index.tsx`:

**Line ~2038 & Line ~2090:**
```typescript
const isDemoMode = false; // ← Change to false
```

### Step 3: Implement Real Services
Update the `otpService` to use real SMS/Email APIs:
```typescript
// Instead of console.log
await sendGridClient.send({...}); // Real email
await twilioClient.messages.create({...}); // Real SMS
```

---

## 📊 What's Logged in Demo Mode

### Console Logs (Backend):
```
🔓 [DEMO MODE] Accepting any 6-digit code for user abc-123-xyz
```

### Audit Logs (Database):
```json
{
  "userId": "abc-123-xyz",
  "action": "otp_verified_success_demo_mode",
  "timestamp": "2025-12-15T10:30:00Z",
  "email": "admin@mfa.gov",
  "note": "Demo mode - any 6-digit code accepted"
}
```

---

## ⚠️ Important Notes

### Security:
- **Demo mode should NEVER be used in production**
- Anyone who knows demo mode is enabled can bypass 2FA
- Always set `isDemoMode = false` before deploying to production

### Testing:
- Demo mode makes testing much easier
- No need to check email/SMS
- No API costs during development
- Perfect for demos and presentations

### Features That Still Work:
- ✅ Account lockout after 5 failed attempts
- ✅ OTP expiry timer (10-15 minutes)
- ✅ Resend code (up to 3 times)
- ✅ Audit logging
- ✅ Force password updates

The only thing bypassed is the **code validation** - everything else works normally!

---

## 🎬 Demo Scenarios

### Scenario 1: Happy Path
```
1. Login as: admin@mfa.gov
2. Choose: Email
3. Enter: 123456
4. ✅ Success - Dashboard loads
```

### Scenario 2: SMS Path
```
1. Login as: analyst@mfa.gov
2. Choose: SMS Text Message
3. Enter: 999999
4. ✅ Success - Analyst dashboard loads
```

### Scenario 3: Wrong Format (Still Validates Input)
```
1. Login as: cfo@mfa.gov
2. Choose: Email
3. Enter: 12345 (only 5 digits)
4. ❌ Error - Need 6 digits
5. Enter: 123456
6. ✅ Success
```

### Scenario 4: Lockout Still Works
```
Note: In demo mode, you can't fail validation
But you can test lockout by temporarily setting:
isDemoMode = false
Then intentionally fail 5 times
```

---

## 🔑 Quick Access Codes

Since ANY 6-digit code works, here are some easy ones:

- **123456** ← Classic
- **000000** ← All zeros
- **111111** ← All ones
- **999999** ← All nines
- **123123** ← Repeating pattern
- **654321** ← Reverse

Pick your favorite! They all work the same. 🎉

---

## 🛠️ Troubleshooting

### "Invalid code" error?
- Make sure you entered exactly 6 digits
- No spaces, letters, or special characters
- Try copy-paste: `123456`

### Can't see the OTP screen?
- Check that AuthWrapper is being used in App.tsx
- Make sure you're signed out first
- Clear browser storage and try again

### Timer expired?
- Click "Resend Code"
- Enter any 6-digit code again
- Works immediately!

---

## ✨ Summary

**Demo Mode = Easy Testing**

- 🔓 Any 6-digit code works
- 📧 No real emails sent
- 📱 No real SMS sent  
- 🚀 Perfect for development
- ⚡ Fast testing
- 💰 No API costs

**When ready for production:**
- Set `isDemoMode = false`
- Configure real email/SMS services
- Deploy with confidence!

---

## 📞 Need Help?

If you have questions about:
- Switching to production mode
- Configuring email/SMS services
- Testing specific scenarios
- Customizing the OTP flow

Just ask! The system is fully functional and ready to go. 🎉
