# Theme Switching Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shared light/dark theme system for all extension pages with persisted switching.

**Architecture:** Store the current theme in shared extension storage, expose it through a single app provider that binds Chakra `Theme` appearance and document-level CSS variables, and reuse one toggle component across extension pages. Replace the most visible hard-coded dark colors in `newtab`, `options`, `popup`, `sidepanel`, and `panel` with semantic theme tokens so both themes render coherently.

**Tech Stack:** React 19, Chakra UI v3, Tailwind CSS 4, Zustand, chrome.storage, Vitest, Playwright

---

### Task 1: Theme foundation

**Files:**
- Create: `src/shared/storages/theme-storage.ts`
- Create: `src/shared/ui/app-theme.css`
- Modify: `src/shared/ui/app-provider.tsx`
- Test: `src/shared/ui/app-provider.test.tsx`

**Step 1: Write the failing test**

Write a test that verifies the provider applies the active theme to the document and falls back to the default theme before storage hydration.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/shared/ui/app-provider.test.tsx`

**Step 3: Write minimal implementation**

Add shared theme storage, document theme sync, and root CSS variables.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/shared/ui/app-provider.test.tsx`

**Step 5: Commit**

```bash
git add docs/plans/2026-03-18-theme-switching.md src/shared/storages/theme-storage.ts src/shared/ui/app-theme.css src/shared/ui/app-provider.tsx src/shared/ui/app-provider.test.tsx
git commit -m "feat: add shared app theme foundation"
```

### Task 2: Shared switcher and page integration

**Files:**
- Create: `src/shared/ui/theme-toggle-button.tsx`
- Modify: `src/pages/newtab/Newtab.tsx`
- Modify: `src/pages/options/Options.tsx`
- Modify: `src/pages/sidepanel/SidePanel.tsx`
- Modify: `src/pages/panel/Panel.tsx`
- Modify: `src/pages/newtab/panel/left-group-side/left-panel-bottom-actions.tsx`
- Test: `e2e/ui/extension-pages.spec.ts`

**Step 1: Write the failing test**

Add a page-level test that toggles theme from one extension page and verifies another extension page reads the same persisted theme.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test e2e/ui/extension-pages.spec.ts -g "theme preference"`

**Step 3: Write minimal implementation**

Render a shared theme toggle control on user-facing extension pages and wire it to shared theme storage.

**Step 4: Run test to verify it passes**

Run: `pnpm exec playwright test e2e/ui/extension-pages.spec.ts -g "theme preference"`

**Step 5: Commit**

```bash
git add e2e/ui/extension-pages.spec.ts src/shared/ui/theme-toggle-button.tsx src/pages/newtab/Newtab.tsx src/pages/options/Options.tsx src/pages/sidepanel/SidePanel.tsx src/pages/panel/Panel.tsx src/pages/newtab/panel/left-group-side/left-panel-bottom-actions.tsx
git commit -m "feat: add shared theme switcher"
```

### Task 3: Theme token rollout

**Files:**
- Modify: `src/pages/newtab/index.css`
- Modify: `src/pages/newtab/style.module.scss`
- Modify: `src/pages/newtab/panel/left-group-side/index.tsx`
- Modify: `src/pages/newtab/panel/left-group-side/group.tsx`
- Modify: `src/pages/newtab/panel/right/index.tsx`
- Modify: `src/pages/newtab/panel/right/comps/group-content/style.module.scss`
- Modify: `src/pages/newtab/panel/right/comps/group-content/tab-item.tsx`
- Modify: `src/pages/newtab/panel/right/comps/group-content/space-item.tsx`
- Modify: `src/pages/newtab/panel/right/comps/current-group/index.tsx`
- Modify: `src/pages/newtab/comps/global-dialog/index.tsx`
- Modify: `src/shared/ui/toast.tsx`
- Modify: `src/pages/panel/Panel.css`

**Step 1: Write the failing test**

Use the same page-level theme test to assert both pages expose the active theme and visible controls after the styling changes.

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test e2e/ui/extension-pages.spec.ts -g "theme preference"`

**Step 3: Write minimal implementation**

Replace hard-coded dark colors with semantic CSS variables and theme-aware highlight styles.

**Step 4: Run test to verify it passes**

Run: `pnpm exec playwright test e2e/ui/extension-pages.spec.ts -g "theme preference"`

**Step 5: Commit**

```bash
git add src/pages/newtab/index.css src/pages/newtab/style.module.scss src/pages/newtab/panel/left-group-side/index.tsx src/pages/newtab/panel/left-group-side/group.tsx src/pages/newtab/panel/right/index.tsx src/pages/newtab/panel/right/comps/group-content/style.module.scss src/pages/newtab/panel/right/comps/group-content/tab-item.tsx src/pages/newtab/panel/right/comps/group-content/space-item.tsx src/pages/newtab/panel/right/comps/current-group/index.tsx src/pages/newtab/comps/global-dialog/index.tsx src/shared/ui/toast.tsx src/pages/panel/Panel.css
git commit -m "style: add light theme tokens to extension pages"
```
