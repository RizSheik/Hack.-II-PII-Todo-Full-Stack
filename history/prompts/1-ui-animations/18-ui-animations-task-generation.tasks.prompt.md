---
id: 18
title: UI Animations Task Generation
stage: tasks
date: 2026-01-25
surface: agent
model: claude-sonnet-4-5
feature: 1-ui-animations
branch: 1-ui-animations
user: user
command: /sp.tasks
labels: ["ui", "animations", "framer-motion", "tasks", "implementation"]
links:
  spec: specs/1-ui-animations/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-ui-animations/tasks.md
tests:
  - Task format validation: All 64 tasks follow checklist format
  - User story organization: 5 user stories mapped to phases
  - Parallel opportunities: 8 tasks marked [P]
  - Independent test criteria: All 5 stories have clear validation
---

## Prompt

Objective:
Granular tasks for AI agent to implement advanced animations in frontend folder.

Task list:

1. Install framer-motion → npm install framer-motion
2. Create variants file (lib/animation-variants.ts): define common variants (fadeInUp, slideInRight, scaleUp, listItemVariants with stagger)
3. Update layout.tsx: wrap main content in motion.main with fadeIn variant
4. Header nav: wrap links in motion.nav + staggerChildren on children
5. tasks.tsx: wrap task list in <AnimatePresence mode="wait"> <motion.ul variants={listVariants} initial="hidden" animate="visible"> …
6. Each task → motion.li variants={itemVariants} layout exit={{ opacity: 0, x: 100, transition: { duration: 0.4 } }}
7. Checkbox complete: whileTap={{ scale: 1.15 }} on parent card + animate color change
8. Add/Edit modal (Shadcn Dialog): wrap DialogContent in motion.div with scale + opacity + spring
9. Empty state: wrap in motion.div variants={staggerFadeIn}
10. Tabs: use motion.span for active indicator with layout prop
11. Add useReducedMotion hook → conditionally disable heavy animations
12. Test: add 5 tasks → complete one → delete two → verify stagger/fade/exit
13. Polish: add whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(139, 92, 246, 0.15)" }} to cards

## Response snapshot

Generated comprehensive task list with 64 actionable tasks organized by user story priority:

**Task Organization**:
- Phase 1 (Setup): 3 tasks - Install Framer Motion and verify environment
- Phase 2 (Foundational): 6 tasks - Create centralized animation configuration system (constants, types, variants, utils, hooks)
- Phase 3 (US1 - P1): 10 tasks - Task list animations (staggered entrance, new task slide-up, completion feedback, delete exit)
- Phase 4 (US2 - P2): 8 tasks - Modal animations (backdrop fade, dialog scale with spring bounce)
- Phase 5 (US3 - P2): 7 tasks - Tab navigation animations (active indicator slide, content crossfade)
- Phase 6 (US4 - P3): 7 tasks - Navigation/header animations (hover scale, tap feedback)
- Phase 7 (US5 - P3): 10 tasks - Empty state and loading animations (staggered fade, pulse)
- Phase 8 (Polish): 13 tasks - Performance validation, accessibility testing, cross-browser verification

**Key Features**:
- All 64 tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- 8 tasks marked [P] for parallel execution (different files, no dependencies)
- Each user story has clear independent test criteria
- Foundational phase (Phase 2) blocks all user stories - must complete first
- User stories can be implemented in parallel after foundational phase
- MVP scope identified: Phases 1-3 (19 tasks) delivers core task list animations

**Implementation Strategy**:
- MVP First: Setup + Foundational + US1 = animated task list (core value)
- Incremental Delivery: Add one user story at a time, test independently
- Parallel Team: After foundational, 5 developers can work on 5 stories simultaneously

**Dependencies**:
- Setup → Foundational → User Stories (parallel) → Polish
- No cross-story dependencies - each story is independently testable
- Within stories: locate → add 'use client' → import → implement → test

**Performance & Accessibility**:
- Performance validation tasks: Chrome DevTools, Lighthouse, bundle size
- Accessibility tasks: Reduced motion testing, keyboard navigation, cross-browser
- All animations must maintain 60fps and CLS = 0

## Outcome

- ✅ Impact: Complete task list with 64 actionable tasks organized by 5 user stories, enabling independent implementation and incremental delivery
- 🧪 Tests: Format validation PASS (64/64 tasks follow checklist format), Organization PASS (5 user stories mapped), Parallel opportunities identified (8 tasks)
- 📁 Files: 1 file created (tasks.md)
- 🔁 Next prompts: Begin implementation with Phase 1 (Setup), then Phase 2 (Foundational), then Phase 3 (US1 MVP)
- 🧠 Reflection: Task generation complete with clear execution order, parallel opportunities, and independent test criteria for each user story. MVP scope (19 tasks) delivers core value. All tasks are immediately executable with specific file paths and clear descriptions.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation completed successfully
- Graders run and results (PASS/FAIL): Format validation PASS (64/64), Organization PASS (5 stories), Dependencies PASS (clear blocking relationships)
- Prompt variant (if applicable): Standard /sp.tasks workflow with user story organization
- Next experiment (smallest change to try): Execute Phase 1 (Setup) tasks T001-T003 to install Framer Motion and verify environment
