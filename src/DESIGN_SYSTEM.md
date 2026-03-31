# Design System Documentation

## Overview
The MFA Rebate Scheme System includes a comprehensive design system showcase page that documents all UI components, colors, typography, and usage guidelines.

## Accessing the Design System Page

**URL:** `/demo`

Simply navigate to `/demo` in your browser to view the complete design system documentation. This page is publicly accessible and does not require authentication.

## What's Included

### 1. **Color Palette**
- Complete color system with semantic naming
- Hex codes for all colors
- Click-to-copy functionality
- Usage descriptions for each color
- Primary: #023F40 (Brand color)
- Secondary: #6DB27F (Accent color)
- Full palette with background, foreground, muted, accent, destructive, and sidebar colors

### 2. **Typography System**
- Font family: Poppins (400, 500, 600, 700)
- Base font size: 16px
- Hierarchical text elements (h1-h4, labels, buttons, inputs)
- Font sizes and weights for each element
- Live examples of each typography style

### 3. **Button Components**
Complete documentation organized in tabs:
- **Variants:** Default, Secondary, Outline, Destructive, Ghost, Link
- **Sizes:** Small, Default, Large, Icon
- **States:** Normal, Hover, Disabled, Focus
- **With Icons:** Icon + Text combinations, Icon-only buttons

### 4. **Badges**
- Default (Primary)
- Secondary
- Outline
- Destructive
- With icons
- Live examples

### 5. **Form Components**
- Text inputs (normal and disabled states)
- Textareas
- Select dropdowns
- Checkboxes
- Switches
- Live interactive examples

### 6. **Alerts**
- Informational alerts
- Error/destructive alerts
- With icons
- Alert titles and descriptions

### 7. **Progress Indicators**
- Progress bars at different completion levels
- Interactive slider component

### 8. **Cards**
- Basic cards
- Cards with badges
- Cards with buttons
- Various layouts

### 9. **Spacing System**
- Common spacing values (gap-2, gap-4, gap-6, p-4, p-6, p-8)
- Usage guidelines for each spacing value

### 10. **Responsive Design**
- Breakpoint documentation
- Mobile-first approach guidelines
- Responsive design patterns

### 11. **Usage Guidelines**
- ✅ **Do's:** Best practices for implementing the design system
- ❌ **Don'ts:** Common mistakes to avoid
- Accessibility considerations

### 12. **Code Examples**
Ready-to-use code snippets for:
- Buttons with icons
- Status badges
- Form fields
- Other common patterns

## Design Tokens

### Colors (CSS Variables)
```css
--primary: #023F40
--secondary: #6DB27F
--background: #FFFFFF
--foreground: #1A1A1A
--muted: #ECECF0
--muted-foreground: #717182
--accent: #E9EBEF
--destructive: #D4183D
--border: rgba(0, 0, 0, 0.1)
--input-background: #F3F3F5
```

### Sidebar Colors
```css
--sidebar: #023F40
--sidebar-primary: #014F50
--sidebar-accent: #035F60
--sidebar-border: #014445
```

### Border Radius
```css
--radius: 0.625rem (10px)
```

### Font Weights
```css
--font-weight-medium: 500
--font-weight-normal: 400
```

## Implementation

All components are built using:
- **React** for component logic
- **Tailwind CSS v4.0** for styling
- **Radix UI** for accessible primitives
- **Lucide React** for icons
- **shadcn/ui** component patterns

## Key Features

### Interactive Elements
- Click-to-copy color codes
- Live button hover states
- Interactive form elements (checkboxes, switches, sliders)
- Tabbed interface for button documentation

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Collapsible sections
- Works on all screen sizes

### Visual Examples
Every component includes:
- Live preview
- Code snippet
- Usage description
- Variant options

## Usage in Development

Import components from their respective paths:
```tsx
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Card } from './components/ui/card';
```

Refer to the code examples in the `/demo` page for specific implementation patterns.

## Brand Guidelines

### Primary Brand Color
**#023F40** must be used for:
- Primary buttons
- Sidebar
- Key brand elements
- Important CTAs

### Secondary Color
**#6DB27F** is used for:
- Secondary highlights
- Review/approval indicators
- Complementary accents

### Typography
**Poppins** must be used throughout:
- All text elements
- Headings use weight 500 (Medium)
- Body text uses weight 400 (Regular)
- Buttons and labels use weight 500 (Medium)

## Maintenance

The design system is defined in:
- `/styles/globals.css` - CSS variables and base styles
- `/components/ui/` - Individual UI components
- `/components/Demo.tsx` - Design system showcase page

Any updates to colors, typography, or component styles should be reflected in both the implementation files and the demo page.

## Questions?

For design system questions or component usage help, refer to:
1. The `/demo` page for visual examples
2. Component source code in `/components/ui/`
3. This documentation file
