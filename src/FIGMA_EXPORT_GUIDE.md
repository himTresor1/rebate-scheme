# Figma Export Guide for Design System

## Overview
The `/demo` page has been enhanced with comprehensive component variants specifically designed for easy Figma export. Every state and variant is visually displayed and organized for quick selection.

## What's Included

### 1. **Input Field States (All Variants)**
Each input state is displayed separately in a grid layout:

- ✅ **Default / Empty** - Empty input with placeholder
- ✅ **With Value** - Input filled with sample text
- ✅ **With Placeholder** - Email placeholder example
- ✅ **Disabled** - Disabled empty state
- ✅ **Disabled with Value** - Disabled with content
- ✅ **With Label** - Labeled input field
- ✅ **Password Type** - Password input variant
- ✅ **Number Type** - Number input with amount
- ✅ **Date Type** - Date picker input

**Location:** Section "Input Field States (All Variants)"
**Grid:** 3 columns on desktop, responsive on mobile

### 2. **Textarea States (All Variants)**
Complete textarea variations:

- ✅ **Default / Empty** - Empty textarea
- ✅ **With Value** - Filled textarea with sample text
- ✅ **Disabled** - Disabled textarea
- ✅ **With Label** - Labeled textarea

**Location:** Section "Textarea States (All Variants)"
**Grid:** 2 columns

### 3. **File Upload Components**
Four different file upload patterns:

- ✅ **Basic File Upload** - Drag & drop zone for documents
- ✅ **Image Upload** - Drag & drop zone for images
- ✅ **File Upload with Button** - Traditional file chooser button
- ✅ **Uploaded File Preview** - File preview with view/delete actions

**Location:** Section "File Upload Components"
**Grid:** 2 columns

### 4. **Download / Export Buttons**
Comprehensive download button variants:

- ✅ **Primary Download Buttons** (4 variants)
  - Download
  - Download Report
  - Download PDF
  - Export Data

- ✅ **Secondary Export Buttons** (3 variants)
  - Download CSV
  - Download Excel
  - Export Report

- ✅ **Outline Export Buttons** (3 variants)
  - Download
  - Export as PDF
  - Export as CSV

- ✅ **Icon-Only Download Buttons** (3 variants)
  - Default, Secondary, Outline

- ✅ **Different Sizes** (3 sizes)
  - Small, Default, Large

**Location:** Section "Download / Export Buttons"
**Layout:** Grouped by category with separators

### 5. **Modal / Dialog Components**
Interactive and static modal examples:

- ✅ **Basic Modal Example** - Interactive modal with trigger
- ✅ **Confirmation Modal** - Destructive action confirmation
- ✅ **Form Modal** - Modal with input form
- ✅ **Modal Structure (Static)** - Two static modal layouts for export:
  - Standard modal with header, content, footer
  - Destructive modal with alert styling

**Location:** Section "Modal / Dialog Components"
**Note:** Click buttons to see interactive modals, or use static versions below for Figma export

## How to Export to Figma

### Method 1: Screenshot Export
1. Navigate to `/demo` in your browser
2. Scroll to the section you want to export
3. Use browser dev tools to take a clean screenshot
4. Import screenshot into Figma

### Method 2: Inspect & Rebuild
1. Open `/demo` page
2. Right-click any component → Inspect
3. Copy HTML structure
4. Note CSS values (spacing, colors, borders)
5. Recreate in Figma using exact measurements

### Method 3: Figma Plugin (HTML to Figma)
1. Use the "HTML to Figma" plugin
2. Select the component section
3. Convert directly to Figma layers

## Component Specifications

### Spacing
- Input height: `h-9` (36px)
- Input padding: `px-3 py-1` (12px horizontal, 4px vertical)
- Label spacing: `space-y-2` (8px gap)
- Section spacing: `space-y-12` (48px gap)

### Colors
- Primary: `#023F40`
- Background: `#FFFFFF`
- Border: `rgba(0, 0, 0, 0.1)`
- Input Background: `#F3F3F5`
- Disabled opacity: `0.5`

### Typography
- Labels: 16px, weight 500, Poppins
- Input text: 16px, weight 400, Poppins
- Placeholders: 16px, weight 400, gray color

### Border Radius
- Inputs: `0.625rem` (10px)
- Buttons: `0.625rem` (10px)
- Cards: `0.625rem` (10px)

## Export Checklist

Before exporting, ensure you capture:

- [ ] All input states (9 variants)
- [ ] All textarea states (4 variants)
- [ ] File upload components (4 variants)
- [ ] Download buttons (all 5 categories)
- [ ] Modal structures (2 static layouts)
- [ ] Button variants (6 types)
- [ ] Button sizes (4 sizes)
- [ ] Badge variants (4 types)
- [ ] Alert types (2 variants)
- [ ] Color palette (13 colors with hex codes)
- [ ] Typography scale (8 elements)

## Tips for Clean Export

1. **Use Full Width:** Maximize browser window for best quality
2. **Zoom Levels:** Use 100% zoom for accurate measurements
3. **Hide UI:** Hide browser chrome for clean screenshots
4. **Group Similar:** Export related components together
5. **Label Everything:** Name layers clearly in Figma
6. **Create Variants:** Use Figma variants for different states

## Measurement Reference

Quick reference for rebuilding in Figma:

### Inputs
```
Width: 100% (fill container)
Height: 36px
Padding: 12px (horizontal), 4px (vertical)
Border: 1px solid rgba(0, 0, 0, 0.1)
Border Radius: 10px
Font: 16px Poppins Regular
```

### Buttons
```
Small: height 32px, padding 12px
Default: height 36px, padding 16px
Large: height 40px, padding 24px
Icon: 36px × 36px
Border Radius: 10px
Font: 16px Poppins Medium
```

### Cards
```
Padding: 24px
Border: 1px solid rgba(0, 0, 0, 0.1)
Border Radius: 10px
Background: #FFFFFF
Shadow: subtle
```

### Modals
```
Max Width: 512px
Padding: 24px
Border Radius: 10px
Shadow: lg
Overlay: rgba(0, 0, 0, 0.3)
```

## File Structure

The demo components are organized in:
- `/components/Demo.tsx` - Main demo page
- `/components/DemoExtended.tsx` - Extended component sections:
  - `DemoInputStates` - All input variants
  - `DemoTextareaStates` - All textarea variants
  - `DemoFileUploads` - File upload components
  - `DemoDownloadButtons` - Download/export buttons
  - `DemoModals` - Modal/dialog components

## Design Tokens

Export these as Figma styles/variables:

### Colors
```
Primary: #023F40
Secondary: #6DB27F
Background: #FFFFFF
Foreground: #1A1A1A
Muted: #ECECF0
Destructive: #D4183D
Border: rgba(0, 0, 0, 0.1)
```

### Typography
```
H1: 24px / Medium (500)
H2: 20px / Medium (500)
H3: 18px / Medium (500)
H4: 16px / Medium (500)
Body: 16px / Regular (400)
Label: 16px / Medium (500)
```

### Spacing Scale
```
gap-2: 8px
gap-4: 16px
gap-6: 24px
p-4: 16px
p-6: 24px
p-8: 32px
```

## Support

For questions or issues with exporting components:
1. Check this guide first
2. Inspect the live component at `/demo`
3. Refer to `/DESIGN_SYSTEM.md` for detailed specs
4. View source code in `/components/Demo.tsx` and `/components/DemoExtended.tsx`

## Last Updated
December 2024

---

**Note:** All components are production-ready and match the actual implementation in the MFA Rebate Scheme System. Export exactly as shown for consistency.
