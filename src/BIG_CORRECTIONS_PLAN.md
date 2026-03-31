# BIG CORRECTIONS IMPLEMENTATION PLAN

## ISSUE 1: QA and CFO Review Pages Don't Match Analyst Enhanced View

**Problem:** QA and CFO are using old review components, not the enhanced one with split screen, scoring, etc.

**Solution:** Update them to use `ApplicationReviewEnhanced.tsx`

**Files to Modify:**
- `/components/qa/QAReview.tsx` - Update to use ApplicationReviewEnhanced
- `/components/qa/QADashboard.tsx` - Update import if needed
- `/components/cfo/CFOReview.tsx` - Update to use ApplicationReviewEnhanced
- `/components/cfo/CFODashboard.tsx` - Update import if needed

---

## ISSUE 2: Application Grouping by Asset Financier Not Implemented

**Problem:** Applications are not grouped by asset financier in any approval level dashboard

**Solution:** Integrate `FinancierGroupedView` component into:
1. Analyst Dashboard
2. QA Dashboard
3. CFO Dashboard  
4. Admin Dashboard (when assigning to analyst)

**Approach:**
- Add toggle between "Grouped View" and "List View"
- Default to Grouped View
- Use existing `FinancierGroupedView` component created earlier

**Files to Modify:**
- `/components/analyst/AnalystDashboard.tsx`
- `/components/qa/QADashboard.tsx`
- `/components/cfo/CFODashboard.tsx`
- `/components/admin/AdminDashboard.tsx` (assignment section)

---

## IMPLEMENTATION ORDER:

1. ✅ Update QA/CFO to use ApplicationReviewEnhanced
2. ✅ Integrate FinancierGroupedView into Analyst Dashboard
3. ✅ Integrate FinancierGroupedView into QA Dashboard
4. ✅ Integrate FinancierGroupedView into CFO Dashboard
5. ✅ Integrate FinancierGroupedView into Admin Dashboard

---

Let's start implementing these changes systematically.
