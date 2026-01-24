---
name: component-polish
description: Standardize all UI elements using shadcn/ui components for a professional, consistent interface.
---

# Component Polish (shadcn/ui)

## Instructions

1. **Component Replacement**
   - Replace native buttons, inputs, and forms with shadcn/ui components
   - Use standard variants, radius, and shadows

2. **Interactivity Enhancements**
   - Ensure hover, focus, and disabled states are polished
   - Add smooth transitions and micro-interactions

3. **Reusability**
   - Create reusable components with props and variants
   - Maintain consistent naming and structure for all components

## Best Practices
- Keep all components consistent in style and spacing
- Avoid inline styles for maintainability
- Use Tailwind utility classes alongside shadcn/ui variants
- Test components across devices and browsers

## Example Structure
```html
<Card className="p-6 shadow-lg rounded-lg">
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
    <CardDescription>Enter your information below.</CardDescription>
  </CardHeader>
  <CardContent>
    <Input placeholder="Your Name" />
    <Button className="mt-4">Submit</Button>
  </CardContent>
</Card>
