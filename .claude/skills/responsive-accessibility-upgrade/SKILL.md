---
name: responsive-accessibility-upgrade
description: Ensure flawless, mobile-first, and accessible UI using Tailwind utilities.
---

# Responsive & Accessibility

## Instructions

1. **Responsive Design**
   - Use mobile-first Tailwind layouts (`sm:`, `md:`, `lg:` breakpoints)
   - Optimize touch targets for buttons and inputs
   - Test layouts across device sizes

2. **Accessibility**
   - Ensure color contrast meets accessibility standards
   - Provide keyboard navigation and focus states
   - Use semantic HTML and ARIA attributes

3. **Performance & Usability**
   - Avoid hidden content for screen readers
   - Ensure interactive components are reachable via keyboard
   - Test for both light and dark themes

## Best Practices
- Always prioritize mobile-first design
- Keep interactive elements large enough for touch
- Ensure high contrast for readability
- Validate accessibility with tools like Lighthouse or axe

## Example Structure
```html
<div class="max-w-4xl mx-auto p-4">
  <form class="space-y-4">
    <label class="block text-gray-700">Name</label>
    <Input placeholder="Enter your name" className="w-full" />
    <Button className="w-full btn-primary">Submit</Button>
  </form>
</div>
