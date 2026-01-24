# Tasks: Advanced UI Animations

**Input**: Design documents from `/specs/1-ui-animations/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in specification - focusing on implementation and manual validation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for source code
- All animation configurations in `frontend/src/lib/animations/`
- Component modifications in `frontend/src/components/` and `frontend/src/app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Framer Motion and initialize project structure for animations

- [x] T001 Install Framer Motion library in frontend directory: `cd frontend && npm install framer-motion`
- [x] T002 Create animations directory structure: `frontend/src/lib/animations/`
- [x] T003 Verify Next.js version supports 'use client' directive (Next.js 13+)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create centralized animation configuration system that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create animation constants file in frontend/src/lib/animations/constants.ts with ANIMATION_DURATION, SPRING_CONFIG, STAGGER_DELAY, SCALE, DISTANCE values
- [x] T005 [P] Create animation types file in frontend/src/lib/animations/types.ts with TypeScript type definitions for AnimationVariant, ContainerVariant, ItemVariant, ReducedMotionVariant
- [x] T006 Create animation variants file in frontend/src/lib/animations/variants.ts with taskListVariants, modalVariants, tabVariants, interactionVariants, emptyStateVariants, skeletonVariants
- [x] T007 [P] Create animation utilities file in frontend/src/lib/animations/utils.ts with createReducedMotionVariant helper function
- [x] T008 Create animation hooks file in frontend/src/lib/animations/hooks.ts with useAnimationVariant hook that uses useReducedMotion from Framer Motion
- [x] T009 Create central export file in frontend/src/lib/animations/index.ts that exports all constants, variants, hooks, and utilities

**Checkpoint**: Animation infrastructure ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Task List Interactions (Priority: P1) 🎯 MVP

**Goal**: Animate task list with staggered entrance, new task slide-up, completion feedback, and delete exit animations

**Independent Test**: Load task list (staggered entrance), add new task (slide up from bottom), mark complete (checkbox scale + color), delete task (fade out + slide right with smooth reflow)

### Implementation for User Story 1

- [x] T010 [US1] Locate and read existing task list component (likely frontend/src/components/tasks/ or frontend/src/app/(dashboard)/tasks/)
- [x] T011 [US1] Add 'use client' directive to task list component file if not already present
- [x] T012 [US1] Import motion, AnimatePresence from framer-motion and taskListVariants from @/lib/animations in task list component
- [x] T013 [US1] Wrap task list container with motion.ul using taskListVariants.container with initial="hidden" animate="visible"
- [x] T014 [US1] Wrap task list with AnimatePresence component using mode="popLayout" for smooth exit animations
- [x] T015 [US1] Convert each task item to motion.li with taskListVariants.item, add layout prop, and exit="exit" for delete animation
- [x] T016 [US1] Implement new task entrance animation using taskListVariants.newItem for newly created tasks
- [x] T017 [US1] Add checkbox completion animation: wrap checkbox or parent card with motion.div using whileTap={{ scale: 1.05 }} and animate color transition on completion state change
- [ ] T018 [US1] Test reduced motion: verify useAnimationVariant hook simplifies animations when prefers-reduced-motion is enabled
- [ ] T019 [US1] Verify task list animations: load page (stagger), add task (slide up), complete task (scale), delete task (slide right + reflow)

**Checkpoint**: At this point, User Story 1 should be fully functional with all task list animations working

---

## Phase 4: User Story 2 - Modal and Dialog Interactions (Priority: P2)

**Goal**: Animate modal dialogs with backdrop fade and dialog scale with spring bounce effect

**Independent Test**: Open "Add Task" or "Edit Task" modal (backdrop fades, dialog scales with bounce), close modal (reverse animation), test with reduced motion

### Implementation for User Story 2

- [x] T020 [US2] Locate existing modal/dialog components (likely using Shadcn/UI Dialog component in frontend/src/components/ui/dialog.tsx or modal usage in task forms)
- [x] T021 [US2] Add 'use client' directive to modal component file if not already present
- [x] T022 [US2] Import motion, AnimatePresence from framer-motion and modalVariants from @/lib/animations
- [x] T023 [US2] Wrap modal backdrop with AnimatePresence and motion.div using modalVariants.backdrop with initial="hidden" animate="visible" exit="exit"
- [x] T024 [US2] Wrap dialog content with motion.div using modalVariants.dialog with initial="hidden" animate="visible" exit="exit" and spring transition
- [x] T025 [US2] Ensure modal open/close state properly triggers AnimatePresence enter/exit animations
- [x] T026 [US2] Test modal animations: open modal (backdrop fade + dialog scale with bounce), close modal (reverse), verify reduced motion simplifies animations
- [x] T027 [US2] Verify modal animations work with keyboard (Escape key) and backdrop click

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Tab Navigation and Filtering (Priority: P2)

**Goal**: Animate tab switching with smooth active indicator slide and content crossfade

**Independent Test**: Click through "All", "Active", "Completed" tabs (indicator slides smoothly, content crossfades), rapidly switch tabs (animations interrupt gracefully)

### Implementation for User Story 3

- [x] T028 [US3] Locate existing tab navigation component (likely in frontend/src/components/ or frontend/src/app/(dashboard)/)
- [x] T029 [US3] Add 'use client' directive to tab component file if not already present
- [x] T030 [US3] Import motion, AnimatePresence from framer-motion and tabVariants from @/lib/animations
- [x] T031 [US3] Create active tab indicator using motion.span with layout prop for smooth slide animation between tabs
- [x] T032 [US3] Wrap tab content with AnimatePresence and motion.div using tabVariants.content with initial="hidden" animate="visible" exit="exit"
- [x] T033 [US3] Ensure tab switching triggers proper enter/exit animations without queuing or visual glitches
- [x] T034 [US3] Test tab animations: switch between all tabs (indicator slides, content crossfades), rapidly click tabs (graceful interruption), verify reduced motion

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Navigation and Header Interactions (Priority: P3)

**Goal**: Add hover scale and tap feedback animations to navigation elements and buttons

**Independent Test**: Hover over navigation items and buttons (subtle scale + glow), tap on touch devices (scale down feedback), verify reduced motion

### Implementation for User Story 4

- [x] T035 [US4] Locate navigation/header components (likely in frontend/src/components/navigation/ or frontend/src/app/layout.tsx)
- [x] T036 [US4] Add 'use client' directive to navigation component files if not already present
- [x] T037 [US4] Import motion from framer-motion and interactionVariants from @/lib/animations
- [x] T038 [P] [US4] Wrap navigation links with motion.a or motion.div using whileHover={{ scale: 1.02 }} and whileTap={{ scale: 0.98 }}
- [x] T039 [P] [US4] Wrap buttons with motion.button using whileHover={{ scale: 1.05 }} and whileTap={{ scale: 0.98 }}
- [x] T040 [US4] Add subtle shadow/glow enhancement on hover using Tailwind classes or inline styles
- [x] T041 [US4] Test navigation animations: hover over items (scale + glow), tap on touch device (scale down), verify reduced motion disables effects

**Checkpoint**: Navigation interactions should feel responsive and polished

---

## Phase 7: User Story 5 - Empty States and Loading Indicators (Priority: P3)

**Goal**: Animate empty states with staggered fade-in and loading skeletons with pulse effect

**Independent Test**: Clear all tasks to see empty state (staggered fade), refresh to see loading skeletons (pulse), verify smooth transition when content loads

### Implementation for User Story 5

- [x] T042 [US5] Locate empty state component (likely in task list component or separate empty state component)
- [x] T043 [US5] Add 'use client' directive to empty state component file if not already present
- [x] T044 [US5] Import motion from framer-motion and emptyStateVariants from @/lib/animations
- [x] T045 [US5] Wrap empty state container with motion.div using emptyStateVariants.container with initial="hidden" animate="visible"
- [x] T046 [US5] Wrap empty state elements (icon, text) with motion.div using emptyStateVariants.item for staggered entrance
- [x] T047 [P] [US5] Locate loading skeleton components (likely in frontend/src/components/ui/ or task list component)
- [x] T048 [P] [US5] Add 'use client' directive to skeleton component file if not already present
- [x] T049 [P] [US5] Import motion from framer-motion and skeletonVariants from @/lib/animations
- [x] T050 [P] [US5] Wrap skeleton elements with motion.div using skeletonVariants.pulse for gentle pulse animation
- [x] T051 [US5] Test empty state and loading animations: clear tasks (staggered fade), refresh (pulse), load content (smooth transition without layout shift)

**Checkpoint**: All edge case animations should be polished and smooth

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Performance validation, accessibility verification, and final polish across all animations

- [x] T052 [P] Add hover animations to task cards: whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(139, 92, 246, 0.15)" }} in task item component
- [x] T053 [P] Audit all animated components for conflicting Tailwind transition classes and remove them (transition-all, transition-*, etc.)
- [x] T054 Verify all animated components have 'use client' directive
- [x] T055 Test animation performance in Chrome DevTools Performance tab: record task list load, add, complete, delete sequence and verify 60fps (green bars only, no yellow/red)
- [x] T056 Test animation performance in Chrome DevTools Layers tab: verify animated elements are on compositing layers with GPU acceleration
- [x] T057 Run Lighthouse performance audit and verify Cumulative Layout Shift (CLS) = 0 during animations
- [x] T058 Test reduced motion accessibility: enable prefers-reduced-motion in browser DevTools and verify all animations are simplified or disabled
- [x] T059 Test keyboard navigation: verify Tab key navigation works correctly and animations don't interfere with focus management
- [x] T060 Test cross-browser compatibility: verify animations work in Chrome, Firefox, Safari (desktop and mobile)
- [x] T061 Test mobile performance: verify animations maintain 60fps on mid-range mobile devices
- [x] T062 Measure bundle size impact: run `npm run build` and verify Framer Motion adds <50KB gzipped
- [x] T063 Manual validation following quickstart.md testing checklist: verify all acceptance scenarios from spec.md
- [x] T064 Document any animation configuration changes or patterns in frontend/src/lib/animations/README.md (if needed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1, US2
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Locate components before modifying them
- Add 'use client' directive before importing Framer Motion
- Import dependencies before using them
- Implement animations before testing them
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks can run sequentially (quick setup)
- **Phase 2 (Foundational)**: T004, T005, T007 can run in parallel (different files)
- **Phase 3-7 (User Stories)**: Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- **Within US4**: T038, T039 can run in parallel (different component types)
- **Within US5**: T047-T050 can run in parallel (empty state and loading are separate)
- **Phase 8 (Polish)**: T052, T053 can run in parallel (different concerns)

---

## Parallel Example: Foundational Phase

```bash
# Launch foundational tasks in parallel (different files):
Task: "Create animation constants file in frontend/src/lib/animations/constants.ts"
Task: "Create animation types file in frontend/src/lib/animations/types.ts"
Task: "Create animation utilities file in frontend/src/lib/animations/utils.ts"
```

## Parallel Example: After Foundational Complete

```bash
# Launch all user stories in parallel (if team capacity allows):
Task: "User Story 1 - Task List Interactions"
Task: "User Story 2 - Modal Interactions"
Task: "User Story 3 - Tab Navigation"
Task: "User Story 4 - Navigation/Header"
Task: "User Story 5 - Empty States/Loading"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T009) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T010-T019)
4. **STOP and VALIDATE**: Test User Story 1 independently per acceptance scenarios
5. Deploy/demo if ready - core task interactions are now animated

### Incremental Delivery

1. Complete Setup + Foundational → Animation infrastructure ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! Core animations working)
3. Add User Story 2 → Test independently → Deploy/Demo (Modals now animated)
4. Add User Story 3 → Test independently → Deploy/Demo (Tabs now animated)
5. Add User Story 4 → Test independently → Deploy/Demo (Navigation now animated)
6. Add User Story 5 → Test independently → Deploy/Demo (Empty states now animated)
7. Complete Polish → Final validation → Production ready
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T009)
2. Once Foundational is done:
   - Developer A: User Story 1 (T010-T019)
   - Developer B: User Story 2 (T020-T027)
   - Developer C: User Story 3 (T028-T034)
3. Stories complete and integrate independently
4. Team reconvenes for Polish phase (T052-T064)

---

## Task Summary

**Total Tasks**: 64
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 6 tasks (BLOCKS all stories)
- Phase 3 (US1 - P1): 10 tasks 🎯 MVP
- Phase 4 (US2 - P2): 8 tasks
- Phase 5 (US3 - P2): 7 tasks
- Phase 6 (US4 - P3): 7 tasks
- Phase 7 (US5 - P3): 10 tasks
- Phase 8 (Polish): 13 tasks

**Parallel Opportunities**: 8 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: Load → stagger, Add → slide up, Complete → scale, Delete → slide right + reflow
- US2: Open modal → backdrop fade + dialog scale bounce, Close → reverse
- US3: Switch tabs → indicator slides, content crossfades, rapid switching → graceful
- US4: Hover → scale + glow, Tap → scale down
- US5: Empty state → stagger fade, Loading → pulse, Content load → smooth transition

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 19 tasks

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests requested in specification - focusing on implementation and manual validation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Performance validation is critical - animations must maintain 60fps
- Accessibility is mandatory - reduced motion must work correctly
- Avoid: animating layout properties (width, height, top, left), conflicting with Tailwind transitions, missing 'use client' directives
