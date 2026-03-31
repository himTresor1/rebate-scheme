# Rebate Scheme System - Test Guideline

## Complete Application Flow Test

**Workflow Path:**
```
Asset Financier → Rebate Analyst → Rebate Manager → E-Moto Program Manager 
→ Approval → Signed Lease Upload → Rebate Manager Review 
→ Designated Finance Officer → Payment Complete
```

---

## Test User Credentials

Based on the seed data, use these credentials for testing:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Asset Financier** | financier@test.com | Test123!@# | Submit applications |
| **Rebate Analyst** | analyst@test.com | Test123!@# | First-level review |
| **Rebate Manager** | rebate.manager@test.com | Test123!@# | Second-level & lease review |
| **E-Moto Program Manager** | program.manager@test.com | Test123!@# | Third-level approval |
| **Designated Finance Officer** | finance@test.com | Test123!@# | Payment processing |
| **M&E Specialist** | me.specialist@test.com | Test123!@# | View-only access |
| **External Reviewer** | external.reviewer@test.com | Test123!@# | View-only access |

---

## Stage 1: Application Submission (Asset Financier)

### Login
1. Navigate to login page
2. Enter: `financier@test.com` / `Test123!@#`
3. Complete MFA if enabled

### What You Can See
- Dashboard with submission statistics
- "New Application" button
- List of your submitted applications
- Application status for each submission

### Actions to Test
1. **Create New Application**
   - Click "New Application" or "Submit New Rebate"
   - Fill in required fields:
     - Applicant Information (Name, ID, Contact)
     - E-Moto Details (Model, Manufacturer, Price)
     - Financing Details (Loan amount, term, interest rate)
     - Upload required documents
   - Submit application

2. **Expected Outcome**
   - Application status: **"Pending Analyst Review"**
   - Application ID assigned (e.g., RBA-2026-001)
   - Timestamp recorded
   - Email/SMS alert sent to Rebate Analyst
   - Application appears in Rebate Analyst's queue

3. **Verify**
   - Application appears in your "Submitted Applications" list
   - Status shows "Pending Analyst Review"
   - Cannot edit after submission
   - Can view application details

---

## Stage 2: First-Level Review (Rebate Analyst)

### Login
1. Logout from Asset Financier account
2. Login as: `analyst@test.com` / `Test123!@#`

### What You Can See
- Dashboard showing pending applications count
- Queue of applications with status "Pending Analyst Review"
- Application details when clicked
- Document verification checklist
- Eligibility scoring interface
- Timer showing days since submission (1-2 day SLA)

### Actions to Test

#### Option A: Approve Application
1. Click on the pending application
2. Review all submitted information
3. Verify documents:
   - National ID (check Social Registry API integration)
   - Vehicle registration (check RURA API integration)
   - Proof of income
   - Finance agreement
4. Calculate/review eligibility score
5. Add review notes
6. Click **"Approve"** button

**Expected Outcome:**
- Status changes to **"Pending Manager Review"**
- Email/SMS alert sent to Rebate Manager
- Your review notes saved
- Timestamp recorded
- Application moves to Rebate Manager's queue
- Timer resets for next stage

#### Option B: Reject Application
1. Click on the pending application
2. Review information
3. Select rejection reason (dropdown)
4. Add detailed rejection notes
5. Click **"Reject"** button

**Expected Outcome:**
- Status changes to **"Rejected at Analyst Level"**
- Email/SMS alert sent to Asset Financier
- Rejection reason and notes saved
- Application removed from workflow queue

#### Option C: Request M&E Investigation
1. Click on the pending application
2. Click **"Request M&E Investigation"** button
3. Add investigation notes
4. Submit request

**Expected Outcome:**
- Status changes to **"Under M&E Investigation"**
- Email/SMS alert sent to M&E Specialist
- Application moves to M&E queue
- Investigation loop initiated

---

## Stage 3: Second-Level Review (Rebate Manager)

### Login
1. Logout from Rebate Analyst account
2. Login as: `rebate.manager@test.com` / `Test123!@#`

### What You Can See
- Dashboard with multiple queues:
  - Applications pending your review
  - Applications pending lease upload (post-approval)
- Application details with Analyst's review notes
- Complete document set
- Eligibility score from Analyst
- Timer showing days in current stage

### Actions to Test

#### Option A: Approve Application
1. Click on application with status "Pending Manager Review"
2. Review Analyst's notes and scoring
3. Verify all documentation
4. Add your review notes
5. Click **"Approve"** button

**Expected Outcome:**
- Status changes to **"Pending Program Manager Review"**
- Email/SMS alert sent to E-Moto Program Manager
- Your approval recorded with timestamp
- Application moves to Program Manager's queue

#### Option B: Reject Application
1. Select rejection reason
2. Add detailed notes
3. Click **"Reject"** button

**Expected Outcome:**
- Status changes to **"Rejected at Manager Level"**
- Email/SMS sent to Asset Financier
- Application removed from workflow

#### Option C: Send Back to Analyst
1. Click **"Send Back to Analyst"** (if this feature exists)
2. Add notes explaining what needs re-review
3. Submit

**Expected Outcome:**
- Status returns to "Pending Analyst Review"
- Notification sent to Rebate Analyst

---

## Stage 4: Third-Level Review (E-Moto Program Manager)

### Login
1. Logout from Rebate Manager account
2. Login as: `program.manager@test.com` / `Test123!@#`

### What You Can See
- Dashboard with applications pending final approval
- Complete application history
- All previous review notes (Analyst + Manager)
- Eligibility calculations
- Program budget/allocation information
- Timer showing days in review

### Actions to Test

#### Option A: Final Approval
1. Click on application with status "Pending Program Manager Review"
2. Review complete application package
3. Verify alignment with program goals
4. Check budget availability
5. Add final approval notes
6. Click **"Approve"** button

**Expected Outcome:**
- Status changes to **"Approved - Pending Lease Upload"**
- Email/SMS alert sent to Asset Financier requesting signed lease
- Application enters post-approval workflow
- Rebate amount confirmed and locked
- Payment authorization generated (pending lease)

#### Option B: Reject Application
1. Select rejection reason
2. Provide detailed explanation
3. Click **"Reject"** button

**Expected Outcome:**
- Status changes to **"Rejected at Program Manager Level"**
- Email/SMS sent to Asset Financier
- Application workflow terminated

---

## Stage 5: Signed Lease Upload (Asset Financier)

### Login
1. Logout from Program Manager account
2. Login as: `financier@test.com` / `Test123!@#`

### What You Can See
- Dashboard section for "Approved Applications Pending Lease"
- Application with status "Approved - Pending Lease Upload"
- Upload interface for signed lease document
- Instructions for lease upload requirements

### Actions to Test
1. Navigate to approved application
2. Click **"Upload Signed Lease"** button
3. Select PDF file (simulated - UI only, no actual storage)
4. Confirm upload

**Expected Outcome:**
- Status changes to **"Lease Uploaded - Pending Manager Review"**
- Email/SMS alert sent to Rebate Manager
- Upload timestamp recorded
- Simulated file reference stored (UI only)
- Application moves to Manager's lease review queue

**Note:** Per requirements, this is UI-only simulation. No actual file is stored in Supabase Storage.

---

## Stage 6: Lease Review (Rebate Manager - Second Time)

### Login
1. Logout from Asset Financier account
2. Login as: `rebate.manager@test.com` / `Test123!@#`

### What You Can See
- Separate queue for "Lease Review Pending"
- Application with uploaded lease document (simulated)
- Original application details
- All approval history

### Actions to Test

#### Option A: Approve Lease
1. Click on application with status "Lease Uploaded - Pending Manager Review"
2. Review simulated lease document
3. Verify lease terms match application
4. Add lease review notes
5. Click **"Approve Lease"** button

**Expected Outcome:**
- Status changes to **"Pending Finance Officer Payment"**
- Email/SMS alert sent to Designated Finance Officer
- Lease approval recorded with timestamp
- Application moves to finance queue
- Payment processing authorized

#### Option B: Reject Lease / Request Reupload
1. Select reason for rejection
2. Add notes explaining issues
3. Click **"Reject Lease"** button

**Expected Outcome:**
- Status returns to **"Approved - Pending Lease Upload"**
- Email/SMS sent to Asset Financier
- Rejection notes recorded
- Asset Financier can reupload corrected lease

---

## Stage 7: Payment Processing (Designated Finance Officer)

### Login
1. Logout from Rebate Manager account
2. Login as: `finance@test.com` / `Test123!@#`

### What You Can See
- Dashboard with applications ready for payment
- Queue of applications with status "Pending Finance Officer Payment"
- Payment details (rebate amount, bank info)
- Complete application audit trail
- Payment authorization documentation

### Actions to Test

#### Process Payment
1. Click on application ready for payment
2. Review payment details:
   - Rebate amount
   - Beneficiary information (Asset Financier)
   - Bank account details
3. Verify all approvals are in place
4. Add payment reference number (simulated)
5. Click **"Process Payment"** button

**Expected Outcome:**
- Status changes to **"Payment Complete"**
- Email/SMS alert sent to Asset Financier confirming payment
- Payment timestamp recorded
- Payment reference number saved
- Application workflow COMPLETE
- Application moves to "Completed" archive
- Audit trail finalized

---

## Stage 8: View-Only Access Testing

### M&E Specialist Access

**Login:** `me.specialist@test.com` / `Test123!@#`

**What You Can See:**
- Dashboard with all applications (read-only)
- Application details at any stage
- All review notes and history
- Documents and eligibility scores

**What You CANNOT Do:**
- No approve/reject buttons
- No edit capabilities
- No status changes
- View-only permissions enforced

**Test:**
1. Try to find any action buttons (should not exist)
2. Verify all information is visible
3. Check that attempting direct URL manipulation doesn't grant access

### External Reviewer Access

**Login:** `external.reviewer@test.com` / `Test123!@#`

**Same as M&E Specialist:**
- Complete read access
- No action permissions
- View-only interface

---

## M&E Investigation Loop (Special Scenario)

### Trigger Investigation
1. Login as Rebate Analyst
2. Select an application
3. Click **"Request M&E Investigation"**
4. Add investigation reason
5. Submit

### M&E Review
1. Logout and login as: `me.specialist@test.com`
2. Navigate to "Investigation Queue"
3. Review application details
4. Add investigation findings/notes
5. Click **"Complete Investigation"**

### Return to Workflow
**Expected Outcome:**
- Status returns to **"Pending Analyst Review"**
- Investigation notes attached to application
- Email/SMS sent to Rebate Analyst
- Analyst can now proceed with approve/reject based on findings

**Note:** M&E cannot approve/reject, only provide findings

---

## Complete End-to-End Test Checklist

- [ ] **Asset Financier** - Submit application successfully
- [ ] **Rebate Analyst** - Receive notification and approve
- [ ] **Rebate Manager** - Receive notification and approve
- [ ] **E-Moto Program Manager** - Receive notification and final approve
- [ ] **Asset Financier** - Receive approval notification and upload signed lease
- [ ] **Rebate Manager** - Receive lease upload notification and approve lease
- [ ] **Designated Finance Officer** - Receive payment authorization and process payment
- [ ] **Asset Financier** - Receive payment confirmation

### Timing Checks
- [ ] Each stage shows days since last action
- [ ] SLA warnings appear after 1-2 days
- [ ] Timestamps recorded at each transition

### Notification Checks
- [ ] Email alerts sent at each stage transition
- [ ] SMS alerts sent at each stage transition (if implemented)
- [ ] Notification content includes application ID and next actions

### Permission Checks
- [ ] M&E Specialist has view-only access
- [ ] External Reviewer has view-only access
- [ ] Each role can only see appropriate queues
- [ ] Direct URL access blocked for unauthorized stages

### Rejection Flow Tests
- [ ] Analyst rejection - blocks workflow
- [ ] Manager rejection - blocks workflow
- [ ] Program Manager rejection - blocks workflow
- [ ] Lease rejection - returns to upload stage

### API Integration Checks
- [ ] Social Registry verification on National ID
- [ ] RURA API verification on vehicle registration
- [ ] RRA API checks (if applicable)
- [ ] API failures handled gracefully

### Audit Trail Verification
- [ ] Every status change logged with timestamp
- [ ] User who made change recorded
- [ ] Review notes preserved
- [ ] Complete history visible to authorized roles

---

## Expected Application Status Flow

```
1. Pending Analyst Review
   ↓ (Analyst Approves)
2. Pending Manager Review
   ↓ (Manager Approves)
3. Pending Program Manager Review
   ↓ (Program Manager Approves)
4. Approved - Pending Lease Upload
   ↓ (Financier Uploads Lease)
5. Lease Uploaded - Pending Manager Review
   ↓ (Manager Approves Lease)
6. Pending Finance Officer Payment
   ↓ (Finance Officer Processes Payment)
7. Payment Complete ✓

Alternative Paths:
- Any rejection → Application terminated
- M&E Investigation → Returns to Analyst Review
- Lease rejection → Returns to Pending Lease Upload
```

---

## Common Issues to Watch For

### Authentication
- MFA blocking test flow
- Session timeout during testing
- Password complexity requirements

### Permissions
- Role-based access not enforcing correctly
- M&E/External Reviewers able to approve (should be impossible)
- Asset Financiers seeing other financiers' applications

### Status Transitions
- Status not updating after approval
- Notifications not sending
- Application stuck in one stage
- Missing buttons for next action

### Data Integrity
- Application ID not generating correctly
- Timestamps not recording
- Review notes not saving
- Audit trail gaps

### UI Issues
- Buttons not appearing for authorized actions
- Queues empty when applications exist
- Timer calculations incorrect
- Document upload interface not working (should be UI-only simulation)

---

## Testing Tips

1. **Use Incognito/Private Windows** for each role to avoid session conflicts
2. **Check browser console** for JavaScript errors
3. **Monitor network tab** to verify API calls
4. **Test happy path first**, then rejection flows
5. **Document any deviations** from expected outcomes
6. **Test with multiple applications** to verify queue management
7. **Verify email/SMS in logs** (if actual sending not configured)

---

## Success Criteria

✅ Complete workflow from submission to payment works without errors  
✅ Each role sees only their authorized queues and actions  
✅ All status transitions occur correctly  
✅ Notifications trigger at each stage  
✅ Timers and SLA tracking function properly  
✅ M&E and External Reviewers have view-only access  
✅ Signed lease upload simulation works (UI-only)  
✅ Payment processing completes the workflow  
✅ Audit trail captures all actions  
✅ API integrations validate documents (Social Registry, RURA, RRA)

---

## Next Steps After Testing

1. Document any bugs or issues found
2. Verify data persistence across sessions
3. Test concurrent applications (multiple in flight)
4. Stress test with bulk submissions
5. Validate reporting and analytics
6. Test edge cases (expired sessions, network failures, etc.)
7. Verify data migration cleaned all existing data except credentials

---

**Last Updated:** February 25, 2026  
**System Version:** Phase 2 - Post-Approval Workflow Implementation  
**Color Scheme:** #023F40 (RGF Green)  
**Font:** Poppins