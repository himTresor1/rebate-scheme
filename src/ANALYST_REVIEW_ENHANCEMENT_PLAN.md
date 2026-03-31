# Rebate Analyst Processing Enhancement Plan

## Current State Analysis

### Existing Components
1. **ApplicationReviewEnhanced.tsx** - Main review interface with:
   - Eligibility checklist (criteria evaluation)
   - Notes field
   - Approve/Reject/Request Clarification actions
   - Score calculation
   - Document viewing capabilities

2. **EligibilityCheckerModal.tsx** - Eligibility verification with:
   - Social Registry API check
   - RURA/RRA API check
   - National ID check
   - Taxi License check
   - Analyst notes
   - Overall eligibility status (eligible/ineligible)

---

## Required Changes

### 1. **Eligibility Checklist Enhancement**
**Location:** `ApplicationReviewEnhanced.tsx`

**Current:** Simple checklist with yes/no evaluation
**Required Changes:**
- ✅ Add document upload capacity to each criterion
- ✅ Add optional comment field per criterion item
- ✅ Display uploaded documents alongside each criterion

**Implementation:**
- Modify `CriteriaEvaluation` interface to include:
  ```typescript
  interface CriteriaEvaluation {
    [criterionId: string]: {
      passed: boolean | null;
      comment?: string;
      documents?: Array<{
        name: string;
        url: string;
        uploadedAt: string;
      }>;
    };
  }
  ```
- Add file upload component to each criterion row
- Add collapsible comment field for each criterion

---

### 2. **Social Registry API Check - Make Mandatory**
**Location:** `EligibilityCheckerModal.tsx`

**Current:** Optional check with button to trigger
**Required Changes:**
- ✅ Make Social Registry check mandatory (must be completed)
- ✅ Add file upload for Social Registry response document
- ✅ Block saving until check is completed and document uploaded

**Implementation:**
- Add validation to prevent saving without Social Registry check
- Add file upload field specifically for Social Registry documentation
- Display uploaded Social Registry document in checklist

---

### 3. **Additional Registered Motorcycles Check**
**Location:** `EligibilityCheckerModal.tsx`

**Current:** Not implemented
**Required Changes:**
- ✅ Add new mandatory check for additional registered motorcycles
- ✅ Query RURA for all motorcycles registered under applicant's National ID
- ✅ Display list of registered motorcycles (if any)
- ✅ Flag if applicant has multiple motorcycles

**Implementation:**
- Add new API check function: `mockAdditionalMotorcyclesCheck()`
- Add new state for motorcycles check
- Display results showing:
  - Number of motorcycles registered
  - Details of each motorcycle (plate, model, year)
  - Warning if multiple motorcycles found

---

### 4. **Additional Documents Upload**
**Location:** `ApplicationReviewEnhanced.tsx`

**Current:** Only displays submitted documents
**Required Changes:**
- ✅ Add section to upload additional documents to the application
- ✅ Allow analyst to add documents beyond what applicant submitted
- ✅ Track who uploaded each document and when

**Implementation:**
- Add "Upload Additional Documents" section in Documents tab
- Allow multiple file uploads
- Tag uploaded files with analyst information
- Display analyst-uploaded documents separately from applicant documents

---

### 5. **Optional Document Authentication via APIs**
**Location:** `EligibilityCheckerModal.tsx`

**Current:** Not implemented
**Required Changes:**
- ✅ Add optional API verification for submitted documents
- ✅ Support verification for:
  - National ID document (via NIDA)
  - Driver's License (via RURA)
  - Tax Clearance (via RRA)
  - Bank statements (via Bank API)

**Implementation:**
- Add optional "Verify Document" buttons next to each document type
- Display verification status (verified/failed/not-verified)
- Store verification results with timestamp
- Show verification badge on documents

---

### 6. **Enhanced Assessment Section**
**Location:** `ApplicationReviewEnhanced.tsx`

**Current:** Single notes field
**Required Changes:**
- ✅ Add mandatory "Explanation" field for approval/rejection rationale
- ✅ Add optional "Comment" field for issues/follow-up notes
- ✅ Separate these fields clearly in the UI

**Implementation:**
- Create new "Assessment" card/section with:
  - **Explanation Field** (required for final decision):
    - Large textarea
    - Character count (minimum 50 characters)
    - Validation before approve/reject
  - **Comments Field** (optional):
    - For internal notes, issues discovered
    - Tags/categories for common issues
- Preserve existing notes field for general observations

---

### 7. **New Routing Option: Forward to M&E**
**Location:** `ApplicationReviewEnhanced.tsx`

**Current:** Only Approve/Reject/Request Clarification
**Required Changes:**
- ✅ Add new action: "Forward to M&E for Investigation"
- ✅ Require reason/notes when forwarding to M&E
- ✅ Update application status to "me-investigation"
- ✅ Send notification to M&E team

**Implementation:**
- Add new button "Forward to M&E" alongside Approve/Reject
- Create dialog for M&E forwarding with:
  - Reason for investigation (required)
  - Specific areas of concern (checklist)
  - Expected investigation timeline
  - Attach relevant documents
- Update status workflow to include M&E investigation stage
- Add M&E review to approval workflow

---

## File Structure Changes

### New/Modified Files

1. **`/components/analyst/ApplicationReviewEnhanced.tsx`**
   - Add enhanced checklist with uploads and comments
   - Add additional documents section
   - Add assessment section (explanation + comments)
   - Add "Forward to M&E" action
   - Update evaluation data structure

2. **`/components/analyst/EligibilityCheckerModal.tsx`**
   - Make Social Registry check mandatory with upload
   - Add additional motorcycles check
   - Add document authentication options
   - Add file upload for Social Registry response

3. **`/components/analyst/DocumentUploadField.tsx`** (NEW)
   - Reusable component for document uploads
   - Shows uploaded files with delete option
   - Handles file validation and upload

4. **`/components/analyst/ForwardToMEDialog.tsx`** (NEW)
   - Dialog for forwarding applications to M&E
   - Captures investigation reasons
   - Areas of concern checklist

5. **`/utils/mockApiResponses.ts`**
   - Add `mockAdditionalMotorcyclesCheck()` function
   - Add `mockDocumentAuthentication()` function

6. **`/utils/api.ts`**
   - Add API methods for file uploads
   - Add `forwardToME()` method
   - Add `uploadCriterionDocument()` method
   - Add `authenticateDocument()` method

---

## API Endpoints Needed

1. **POST** `/api/applications/{id}/criteria-documents` - Upload document for criterion
2. **POST** `/api/applications/{id}/additional-documents` - Upload additional document
3. **POST** `/api/applications/{id}/forward-me` - Forward to M&E
4. **POST** `/api/documents/{id}/authenticate` - Authenticate document via API
5. **GET** `/api/rura/motorcycles/{nationalId}` - Get all registered motorcycles
6. **POST** `/api/social-registry/upload` - Upload Social Registry response

---

## UI/UX Flow Changes

### Enhanced Review Process
1. Analyst opens application
2. Reviews applicant information and documents
3. **NEW:** Clicks "Check Eligibility" to open enhanced eligibility modal
4. **NEW:** Completes MANDATORY Social Registry check + file upload
5. **NEW:** Completes MANDATORY additional motorcycles check
6. **NEW:** Optionally authenticates submitted documents via APIs
7. Goes through eligibility checklist:
   - Evaluates each criterion (Pass/Fail)
   - **NEW:** Adds optional comments per criterion
   - **NEW:** Uploads supporting documents per criterion
8. **NEW:** Optionally uploads additional documents to application
9. **NEW:** Fills out Assessment section:
   - **Required:** Explanation field (rationale for decision)
   - **Optional:** Comments field (issues, follow-ups)
10. Makes decision:
    - Approve → goes to QA/Manager
    - Reject → application rejected
    - Request Clarification → back to Asset Financier
    - **NEW:** Forward to M&E → goes to M&E investigation

---

## Data Model Changes

### Enhanced Evaluation Object
```typescript
{
  applicationId: string;
  criteriaEvaluations: {
    [criterionId: string]: {
      passed: boolean | null;
      comment?: string;
      documents?: Array<{
        name: string;
        url: string;
        uploadedAt: string;
        uploadedBy: string;
      }>;
    };
  };
  notes: string; // General notes
  assessment: {
    explanation: string; // Required for final decision
    comments?: string; // Optional issues/follow-ups
  };
  eligibilityCheck: {
    socialRegistryCheck: {
      status: 'completed' | 'pending';
      verified: boolean;
      data: any;
      documentUrl?: string; // NEW
      checkedAt?: string;
    };
    additionalMotorcyclesCheck: { // NEW
      status: 'completed' | 'pending';
      motorcycles: Array<{
        plateNumber: string;
        model: string;
        year: string;
        registeredDate: string;
      }>;
      hasMultiple: boolean;
      checkedAt?: string;
    };
    documentAuthentication?: { // NEW
      [documentId: string]: {
        verified: boolean;
        verifiedAt: string;
        verificationMethod: string;
        notes?: string;
      };
    };
  };
  additionalDocuments?: Array<{ // NEW
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
    documentType: string;
  }>;
  decision?: 'approve' | 'reject' | 'me-investigation';
  rejectionReason?: string;
  meInvestigationReason?: string; // NEW
  score: number;
}
```

---

## Summary of Implementation Steps

### Phase 1: Eligibility Modal Enhancements
1. Make Social Registry check mandatory with file upload
2. Add additional motorcycles check
3. Add optional document authentication

### Phase 2: Checklist Enhancements
1. Update checklist data structure to support comments + documents
2. Add file upload to each criterion
3. Add collapsible comment field per criterion

### Phase 3: Assessment Section
1. Create new Assessment card
2. Add Explanation field (required)
3. Add Comments field (optional)
4. Add validation for explanation before decision

### Phase 4: Additional Documents
1. Create document upload section
2. Allow multiple file uploads
3. Track uploader information

### Phase 5: M&E Forwarding
1. Create ForwardToMEDialog component
2. Add M&E forwarding action
3. Update status workflow
4. Add M&E investigation status

### Phase 6: Testing & Integration
1. Test all file uploads
2. Test mandatory validations
3. Test M&E forwarding flow
4. Test document authentication
5. Update notifications for M&E forwarding

---

## Estimated Changes Summary

**Files to Modify:** 3
- ApplicationReviewEnhanced.tsx
- EligibilityCheckerModal.tsx
- mockApiResponses.ts

**Files to Create:** 2
- DocumentUploadField.tsx
- ForwardToMEDialog.tsx

**New Features:** 7
1. ✅ Document upload per criterion
2. ✅ Comments per criterion
3. ✅ Mandatory Social Registry check + upload
4. ✅ Mandatory additional motorcycles check
5. ✅ Additional documents upload
6. ✅ Optional document authentication
7. ✅ Forward to M&E action
8. ✅ Enhanced assessment section

**Breaking Changes:** Minimal
- Existing evaluation data structure will be migrated
- New fields are optional/additive
- UI is enhanced, not replaced
