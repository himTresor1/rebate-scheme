# 🔐 RGF Rebate Scheme System - Login Credentials

## All credentials extracted directly from `/supabase/functions/server/seed.tsx`

---

## 🏛️ **SYSTEM ADMINISTRATOR**

| Role | Email | Password | Name |
|------|-------|----------|------|
| System Admin | `admin@mfa.rw` | `SecureAdmin@2026` | System Administrator |

**Permissions:** Full system access, manage users, roles, permissions, system settings

---

## 👥 **INTERNAL RGF STAFF**

### Rebate Analysts (2)
| Email | Password | Name | Phone |
|-------|----------|------|-------|
| `analyst1@mfa.rw` | `SecureAnalyst@2026` | Alice Mugisha | +250788234567 |
| `analyst2@mfa.rw` | `SecureAnalyst@2026` | Brian Nkusi | +250788345678 |

**Permissions:** Review applications, verify documents, API checks, eligibility assessment

---

### Rebate Managers (2)
| Email | Password | Name | Phone |
|-------|----------|------|-------|
| `manager1@mfa.rw` | `SecureManager@2026` | Catherine Uwera | +250788456789 |
| `manager2@mfa.rw` | `SecureManager@2026` | David Habimana | +250788567890 |

**Permissions:** Approve/reject analyst reviews, manage workflow, oversight

---

### E-Moto Program Manager (1)
| Email | Password | Name | Phone |
|-------|----------|------|-------|
| `program.manager@mfa.rw` | `SecureProgram@2026` | Tony Nsengimana | +250788567891 |

**Permissions:** Program oversight, analytics, reporting

---

### Designated Finance Officers (2)
| Email | Password | Name | Phone |
|-------|----------|------|-------|
| `finance1@mfa.rw` | `SecureFinance@2026` | Finance Officer 1 | +250788678902 |
| `finance2@mfa.rw` | `SecureFinance@2026` | Finance Officer 2 | +250788678903 |

**Permissions:** Two-signature finance workflow, approve disbursements, payment processing

---

### M&E Team Members (2)
| Email | Password | Name | Phone |
|-------|----------|------|-------|
| `me1@mfa.rw` | `SecureME@2026` | M&E Officer 1 | +250788789012 |
| `me2@mfa.rw` | `SecureME@2026` | M&E Officer 2 | +250788789013 |

**Permissions:** Investigation loops, monitoring & evaluation, field verification

---

### External Auditor (1)
| Email | Password | Name | Phone |
|-------|----------|------|-------|
| `auditor@external.com` | `SecureAuditor@2026` | External Auditor | +250788890001 |

**Permissions:** Read-only access to all applications, audit trails, reports

---

## 🏦 **ASSET FINANCIER ADMINS (Banks & MFIs)**

### Bank of Kigali
| Email | Password | Name | Phone | Organization |
|-------|----------|------|-------|--------------|
| `admin@bankofkigali.rw` | `SecureBoK@2026` | Grace Mukandori | +250788890123 | Bank of Kigali |

---

### Equity Bank Rwanda
| Email | Password | Name | Phone | Organization |
|-------|----------|------|-------|--------------|
| `admin@equitybank.rw` | `SecureEquity@2026` | Henry Ntirenganya | +250788901234 | Equity Bank Rwanda |

---

### Vision Finance Company
| Email | Password | Name | Phone | Organization |
|-------|----------|------|-------|--------------|
| `admin@visionfinance.rw` | `SecureVision@2026` | Irene Uwimana | +250788012345 | Vision Finance Company |

---

### Umurenge SACCO
| Email | Password | Name | Phone | Organization |
|-------|----------|------|-------|--------------|
| `admin@umurenge.rw` | `SecureUmurenge@2026` | James Nshimiyimana | +250788123567 | Umurenge SACCO |

**Permissions:** Submit applications, view own applications, manage staff, register organization

---

## 🏍️ **E-MOTO COMPANIES (Claims Officers)**

### Ampersand Rwanda
| Email | Password | Name | Phone | Organization |
|-------|----------|------|-------|--------------|
| `claims@ampersand.rw` | `SecureAmpersand@2026` | Kevin Bizimana | +250788234678 | Ampersand Rwanda |

---

### EV Electric Rwanda
| Email | Password | Name | Phone | Organization |
|-------|----------|------|-------|--------------|
| `claims@evelectric.rw` | `SecureEV@2026` | Linda Keza | +250788345789 | EV Electric Rwanda |

---

### Opibus Rwanda
| Email | Password | Name | Phone | Organization |
|-------|----------|------|-------|--------------|
| `claims@opibus.rw` | `SecureOpibus@2026` | Martin Uwizeye | +250788456890 | Opibus Rwanda |

**Permissions:** Submit claims, view claim status, track payments

---

## 📊 **QUICK REFERENCE - By Role**

### Password Pattern
All passwords follow the format: `Secure[Entity]@2026`

### Total Users Created
- **1** System Administrator
- **2** Rebate Analysts  
- **2** Rebate Managers
- **1** E-Moto Program Manager
- **2** Designated Finance Officers
- **2** M&E Team Members
- **1** External Auditor
- **4** Asset Financier Admins (Banks/MFIs)
- **3** Claims Officers (E-Moto Companies)

**TOTAL: 18 Users**

---

## 🔑 **Testing Recommendations**

### Test as Analyst:
```
Email: analyst1@mfa.rw
Password: SecureAnalyst@2026
```

### Test as Asset Financier:
```
Email: admin@bankofkigali.rw
Password: SecureBoK@2026
```

### Test as Finance Officer:
```
Email: finance1@mfa.rw
Password: SecureFinance@2026
```

### Test as Manager:
```
Email: manager1@mfa.rw
Password: SecureManager@2026
```

### Test as System Admin:
```
Email: admin@mfa.rw
Password: SecureAdmin@2026
```

---

## ⚠️ **Security Notes**

1. All users have `email_confirm: true` set automatically
2. Passwords are for **DEVELOPMENT/TESTING ONLY**
3. In production, implement:
   - Password complexity requirements
   - Password expiration policies
   - Two-factor authentication (2FA)
   - Account lockout after failed attempts
   - Secure password reset flows

---

**Last Updated:** March 5, 2026
**Source File:** `/supabase/functions/server/seed.tsx`