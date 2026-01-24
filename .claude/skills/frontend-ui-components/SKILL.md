---
name: frontend-ui-components
description: Upgrade and refine frontend UI components with modern styling, layout, and usability improvements.
---

# Frontend UI Components & Styling

## Instructions

1. **Component structure**
   - Identify existing UI components (cards, buttons, forms, lists)
   - Refactor into clean, reusable components
   - Maintain separation of structure, style, and behavior

2. **Layout & spacing**
   - Improve alignment using Flexbox / Grid
   - Apply consistent padding, margins, and gaps
   - Strengthen visual hierarchy (headings, sections, emphasis)

3. **Styling & visuals**
   - Modern color palette with sufficient contrast
   - Consistent typography (font sizes, weights, line-height)
   - Subtle shadows, borders, and rounded corners
   - Clear hover, focus, and active states

4. **Responsiveness**
   - Mobile-first layout adjustments
   - Tablet and desktop refinements
   - Ensure components adapt without breaking layout

## Best Practices
- Do not change existing functionality or data flow
- Keep UI minimal, readable, and intuitive
- Use consistent component patterns across the app
- Avoid over-design; prioritize usability
- Ensure accessibility (contrast, focus states, semantic HTML)

## Example Structure
```html
<div class="ui-card">
  <h3 class="ui-card-title">Task Title</h3>
  <p class="ui-card-description">
    Short description explaining the purpose of this component.
  </p>
  <div class="ui-card-actions">
    <button class="btn-primary">Primary Action</button>
    <button class="btn-secondary">Secondary</button>
  </div>
</div>
