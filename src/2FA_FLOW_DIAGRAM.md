# 🔐 Complete 2FA Authentication Flow

## Visual Flow Diagram

```
                    ┌─────────────────────────────────┐
                    │     USER OPENS APPLICATION      │
                    └────────────────┬────────────────┘
                                     │
                                     ↓
                    ┌─────────────────────────────────┐
                    │   App.tsx checks auth status    │
                    │   authService.getCurrentUser()  │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ↓                                 ↓
        ┌──────────────────────┐         ┌──────────────────────┐
        │   User = null        │         │   User = exists      │
        │   Show AuthWrapper   │         │   Show Dashboard     │
        └──────────┬───────────┘         └──────────────────────┘
                   │
                   ↓
    ╔══════════════════════════════════════════════════════════╗
    ║                 STEP 1: LOGIN SCREEN                      ║
    ║                  (AuthWrapper renders)                    ║
    ╚══════════════════════════════════════════════════════════╝
                   │
                   ↓
        ┌────────────────────────────────┐
        │      AuthForm Component        │
        │  • Email input                 │
        │  • Password input              │
        │  • Sign In button              │
        │  • Register as Asset           │
        │    Financier button            │
        └────────────┬───────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ↓                         ↓
┌──────────────┐       ┌──────────────────────┐
│ Click        │       │ Click "Register as   │
│ "Sign In"    │       │ Asset Financier"     │
└──────┬───────┘       └──────┬───────────────┘
       │                      │
       ↓                      ↓
       │            ┌──────────────────────┐
       │            │ AssetFinancierReg    │
       │            │ Form opens           │
       │            └──────────────────────┘
       │
       ↓
┌────────────────────────────────┐
│ authService.signIn()           │
│ • Validates credentials        │
│ • Gets Supabase session        │
└────────────┬───────────────────┘
             │
             ↓
┌────────────────────────────────┐
│ authService.getCurrentUser()   │
│ • Fetches user profile         │
│ • Returns user object          │
└────────────┬───────────────────┘
             │
             ↓
┌────────────────────────────────┐
│ onLoginSuccess(user) called    │
│ • AuthWrapper receives user    │
└────────────┬───────────────────┘
             │
             ↓
    ┌────────────────┴─────────────┐
    │                              │
    ↓                              ↓
┌──────────────────┐    ┌───────────────────────┐
│ requiresPassword │    │ Normal user           │
│ Change = true    │    │ (no force update)     │
└────────┬─────────┘    └───────────┬───────────┘
         │                          │
         ↓                          │
╔════════════════════╗              │
║ FORCE PASSWORD     ║              │
║ UPDATE SCREEN      ║              │
║                    ║              │
║ • New password    ║              │
║ • Name            ║              │
║ • Email           ║              │
║ • Phone           ║              │
╚════════╦═══════════╝              │
         │                          │
         ↓                          │
┌─────────────────┐                 │
│ Update creds    │                 │
│ Sign out        │                 │
│ Back to login   │                 │
└─────────────────┘                 │
                                    │
         ┌──────────────────────────┘
         │
         ↓
    ╔══════════════════════════════════════════════════════════╗
    ║            STEP 2: OTP METHOD SELECTION                   ║
    ║              (OTPMethodSelection renders)                 ║
    ╚══════════════════════════════════════════════════════════╝
         │
         ↓
┌────────────────────────────────┐
│  Two-Factor Authentication     │
│                                │
│  ┌───────────────────────┐    │
│  │  📱 SMS Text Message  │    │
│  │  +1-555-0000          │    │
│  └───────────────────────┘    │
│                                │
│  ┌───────────────────────┐    │
│  │  📧 Email             │    │
│  │  user@example.com     │    │
│  └───────────────────────┘    │
└────────────┬───────────────────┘
             │
             ↓
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌─────────┐      ┌─────────┐
│ Select  │      │ Select  │
│ SMS     │      │ Email   │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              │
              ↓
┌─────────────────────────────────┐
│ handleOTPMethodSelect(method)   │
│ • POST /auth/request-otp        │
│ • Backend generates OTP         │
│ • Stores in KV store            │
└────────────┬────────────────────┘
             │
             ↓
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌─────────────┐  ┌──────────────────┐
│ SMS Method  │  │  Email Method    │
│             │  │                  │
│ Console log │  │  Console log     │
│ "Sent SMS"  │  │  "Sent email"    │
│             │  │  + Shows OTP     │
│ Shows OTP   │  │  + Shows link    │
└─────┬───────┘  └────────┬─────────┘
      │                   │
      └─────────┬─────────┘
                │
                ↓
    ╔══════════════════════════════════════════════════════════╗
    ║             STEP 3: OTP VERIFICATION                      ║
    ║             (OTPVerification renders)                     ║
    ╚══════════════════════════════════════════════════════════╝
                │
                ↓
┌────────────────────────────────────────┐
│   Enter Verification Code              │
│                                        │
│   We've sent a code to:                │
│   user@example.com                     │
│                                        │
│   ┌────────────────────────────────┐  │
│   │ 🔓 Demo Mode: Enter any        │  │
│   │    6-digit code (e.g. 123456)  │  │
│   └────────────────────────────────┘  │
│                                        │
│   [1] [2] [3] [4] [5] [6]             │
│                                        │
│   ⏱️ Code expires in 10:00            │
│                                        │
│   [     Verify Code      ]             │
│                                        │
│   Didn't receive? [Resend Code]        │
└────────────────┬───────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ↓                  ↓
┌──────────────┐   ┌──────────────────┐
│ User types   │   │ User clicks      │
│ 6 digits     │   │ Resend           │
│              │   │                  │
│ Auto-submits │   │ Restart timer    │
└──────┬───────┘   │ New OTP sent     │
       │           └──────────────────┘
       ↓
┌────────────────────────────────┐
│ handleVerify(code)             │
│ • POST /auth/verify-otp        │
│ • Backend validates            │
└────────────┬───────────────────┘
             │
             ↓
┌────────────────────────────────┐
│ DEMO MODE CHECK                │
│ isDemoMode = true              │
│ /^\d{6}$/.test(code)           │
└────────────┬───────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌─────────────┐   ┌──────────────┐
│ YES         │   │ NO           │
│ Is 6 digits │   │ Not 6 digits │
│             │   │              │
│ ✅ SUCCESS  │   │ ❌ ERROR     │
└─────┬───────┘   └──────┬───────┘
      │                  │
      ↓                  ↓
┌──────────────┐   ┌────────────────┐
│ Clear OTP    │   │ Show error     │
│ Log audit    │   │ Clear inputs   │
│ Return 200   │   │ Focus first    │
└──────┬───────┘   └────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ onVerify() success           │
│ • AuthWrapper calls onSuccess│
└──────────────┬───────────────┘
               │
               ↓
    ╔══════════════════════════════════════════════════════════╗
    ║                  STEP 4: SUCCESS!                         ║
    ║                 (App.tsx renders main)                    ║
    ╚══════════════════════════════════════════════════════════╝
               │
               ↓
┌──────────────────────────────┐
│ App.tsx checkAuth() runs     │
│ • Gets current user          │
│ • Sets user state            │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│ User state updated           │
│ • AuthWrapper unmounts       │
│ • Dashboard mounts           │
└──────────────┬───────────────┘
               │
               ↓
    ┌──────────┴──────────┐
    │                     │
    ↓                     ↓
┌─────────────┐   ┌──────────────┐
│ SYSTEM      │   │ Other Role   │
│ ADMIN       │   │ Dashboards   │
│ Dashboard   │   │              │
└─────────────┘   └──────────────┘

```

---

## Alternative Flows

### Email Link Verification

```
User clicks email link
        ↓
GET /verify-email-otp?userId=xxx&code=123456
        ↓
Demo mode check
        ↓
✅ Success HTML page shown
        ↓
User manually returns to app
        ↓
Still needs to enter OTP in app
(Email link is supplementary)
```

### Account Lockout Flow

```
User enters wrong code (if demo mode = false)
        ↓
Failed attempts counter++
        ↓
If attempts >= 5:
        ↓
┌─────────────────────────┐
│ Set lockoutUntil        │
│ = now + 30 minutes      │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ Return 400 error        │
│ with lockoutUntil       │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ Frontend shows:         │
│ "Account locked for     │
│  30 minutes"            │
└─────────────────────────┘
```

### Resend Code Flow

```
User clicks "Resend Code"
        ↓
resendCount < 3?
        ↓
┌──────YES──────┐    ┌──────NO──────┐
│               │    │              │
↓               │    ↓              │
Generate new OTP     Show error:    │
Send to user         "Max resends   │
Reset timer          reached"       │
resendCount++        │
│                    │
└────────────────────┘
```

---

## Component Communication

```
App.tsx
  │
  └─> AuthWrapper
        │
        ├─> AuthForm
        │     │
        │     └─> onLoginSuccess(user) → back to AuthWrapper
        │
        ├─> OTPMethodSelection
        │     │
        │     └─> onSelectMethod(method) → handleOTPMethodSelect
        │
        ├─> OTPVerification
        │     │
        │     ├─> onVerify(code) → handleOTPVerify
        │     ├─> onResend() → handleOTPResend
        │     └─> onBack() → handleLogout
        │
        └─> onSuccess() → back to App.tsx → checkAuth()
```

---

## Backend Endpoints Used

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/auth/request-otp` | POST | Generate and send OTP | Public |
| `/auth/verify-otp` | POST | Validate OTP code | Public |
| `/verify-email-otp` | GET | Email link verification | Public |
| `/me` | GET | Get current user profile | Session |

---

## Data Flow

### User Object Structure:
```typescript
{
  id: string              // Supabase user ID
  email: string           // User's email
  name: string            // Display name
  role: string            // System role
  phoneNumber?: string    // Phone for SMS (default: +1-555-0000)
  requiresPasswordChange?: boolean  // Force update flag
  permissions?: string[]  // Effective permissions
  createdAt: string       // ISO timestamp
  updatedAt?: string      // ISO timestamp
}
```

### OTP Record Structure:
```typescript
{
  code: string           // 6-digit code
  method: 'sms' | 'email'
  expiresAt: string      // ISO timestamp
  attempts: number       // Failed attempts count
  lockoutUntil?: string  // ISO timestamp if locked
  createdAt: string      // ISO timestamp
}
```

### Audit Log Structure:
```typescript
{
  userId: string
  action: string  // 'otp_verified_success_demo_mode', etc.
  timestamp: string
  email: string
  note?: string
  error?: string
}
```

---

## State Management

### AuthWrapper State:
```typescript
step: 'login' | 'otp-method' | 'otp-verify' | 'force-update'
authData: User | null
otpMethod: 'sms' | 'email' | null
otpDestination: string
otpExpiryMinutes: number
```

### OTPVerification State:
```typescript
code: string[]  // Array of 6 digits
loading: boolean
resendCount: number  // 0-3
timeRemaining: number  // seconds
lockoutUntil: Date | null
```

---

## Demo Mode vs Production

### Demo Mode (Current):
```
User enters code
      ↓
Is it 6 digits?
      ↓
    YES
      ↓
✅ Success (no validation)
```

### Production Mode (Future):
```
User enters code
      ↓
Is it 6 digits?
      ↓
    YES
      ↓
Get stored OTP from database
      ↓
Does code match?
      ↓
Is it expired?
      ↓
Increment attempts
      ↓
Check lockout
      ↓
✅ Success or ❌ Error
```

---

## Key Files

| File | Purpose |
|------|---------|
| `/App.tsx` | Main entry, renders AuthWrapper or Dashboard |
| `/components/auth/AuthWrapper.tsx` | Orchestrates 2FA flow |
| `/components/AuthForm.tsx` | Login form |
| `/components/auth/OTPMethodSelection.tsx` | Choose SMS/Email |
| `/components/auth/OTPVerification.tsx` | Enter OTP code |
| `/components/auth/ForcePasswordUpdate.tsx` | Update credentials |
| `/supabase/functions/server/index.tsx` | Backend endpoints |
| `/utils/auth.tsx` | Auth service functions |

---

## Security Considerations

### Current (Demo Mode):
- ⚠️ **Not secure** - any code accepted
- ✅ Good for: Development, testing, demos
- ❌ Bad for: Production, real users

### Future (Production):
- ✅ Real OTP validation
- ✅ SMS/Email delivery
- ✅ Rate limiting
- ✅ Account lockout
- ✅ Audit logging
- ✅ Encrypted storage

---

## Testing Checklist

- [ ] Login with valid credentials
- [ ] See 2FA method selection screen
- [ ] Choose SMS method
- [ ] See OTP input screen
- [ ] Enter 123456
- [ ] See dashboard load
- [ ] Logout and repeat with Email method
- [ ] Test paste functionality (paste 123456)
- [ ] Test resend code button
- [ ] Test "Back to Login" button
- [ ] Test with different user roles
- [ ] Verify demo mode banner visible
- [ ] Check console logs for demo mode messages

---

**Last Updated:** December 15, 2024  
**Status:** ✅ Fully Operational  
**Demo Mode:** 🔓 Enabled
