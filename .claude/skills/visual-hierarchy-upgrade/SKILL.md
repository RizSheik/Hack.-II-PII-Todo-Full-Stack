---
name: visual-hierarchy-upgrade
description: Use Tailwind to create clean, structured, and premium layouts with clear visual hierarchy.
---

# Visual Hierarchy & Layout (Tailwind)

## Instructions

1. **Containers & Layout**
   - Use max-width containers for content
   - Apply consistent padding and margin scales
   - Use Flexbox and Grid for structured layouts
   - Group related content with Card components

2. **Visual Hierarchy**
   - Make primary CTAs visually dominant
   - Use font weight, size, and color for emphasis
   - Highlight sections with subtle backgrounds or borders

3. **Spacing & Alignment**
   - Keep consistent spacing across components
   - Align elements using Tailwind utilities (`flex`, `items-center`, `justify-between`)
   - Avoid cluttered layouts

## Best Practices
- Follow a modular layout approach
- Maintain consistent spacing, typography, and colors
- Use Tailwind classes for all spacing and alignment
- Mobile-first design approach

## Example Structure
```html
<div class="max-w-7xl mx-auto p-4">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="card p-6 shadow-md rounded-lg">
      <h2 class="text-xl font-bold">Card Title</h2>
      <p class="text-gray-600 mt-2">Card description goes here.</p>
      <button class="btn-primary mt-4">Action</button>
    </div>
  </div>
</div>
