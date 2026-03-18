# PinTabs Toolchain Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the repository to the latest practical build, lint, styling, and test stack while adding browser-extension e2e coverage and authoring `agents.md`.

**Architecture:** Keep the extension-specific multi-entry Vite architecture, migrate the bundler underneath to `rolldown-vite`, centralize Chakra/provider compatibility in shared entrypoints, and introduce Playwright-based extension fixtures for end-to-end coverage. Preserve the current feature surface while modernizing scripts and repo conventions.

**Tech Stack:** React, Chakra UI, Zustand, Tailwind CSS v4, rolldown-vite, tsgo, Oxlint, Vitest, Playwright

---

### Task 1: Baseline and dependency matrix

**Files:**
- Modify: `package.json`
- Modify: `.nvmrc`
- Modify: `pnpm-lock.yaml`

**Step 1: Record the current baseline**

Run: `pnpm test -- --run`
Expected: current Vitest suite passes

**Step 2: Record the current build status**

Run: `pnpm build`
Expected: current extension build succeeds

**Step 3: Replace the dependency matrix**

Update runtime and dev dependencies to the target stack, removing `eslint`, `prettier`, `rollup`, and the old TypeScript CLI wiring.

**Step 4: Install and refresh the lockfile**

Run: `pnpm install`
Expected: lockfile reflects the new dependency graph

### Task 2: Build, dev, and lint pipeline migration

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `utils/reload/rollup.config.mjs`
- Create: `.oxlintrc.json`
- Delete: `.eslintrc`
- Delete: `.prettierrc`

**Step 1: Write a failing verification command**

Run: `pnpm lint`
Expected: it fails until the Oxlint migration is wired

**Step 2: Replace script entrypoints**

Move build/typecheck/lint scripts to `tsgo`, `oxlint`, and the new Vite/Rolldown pipeline.

**Step 3: Remove obsolete config**

Delete ESLint/Prettier config and any scripts that still reference them.

**Step 4: Verify the new lint/build entrypoints**

Run: `pnpm lint`
Expected: passes with Oxlint

### Task 3: Tailwind and Chakra compatibility

**Files:**
- Modify: `postcss.config.js`
- Modify: `tailwind.config.js` or remove if no longer needed
- Modify: `src/pages/options/Options.css`
- Modify: `src/pages/newtab/index.css`
- Modify: `src/pages/newtab/theme.ts`
- Modify: `src/pages/newtab/Newtab.tsx`
- Modify: `src/pages/options/Options.tsx`
- Modify: Chakra-using components under `src/pages/newtab/**`

**Step 1: Add a failing build after dependency install**

Run: `pnpm build`
Expected: it fails on styling or Chakra API incompatibilities

**Step 2: Migrate styling entrypoints**

Update Tailwind v4 imports and PostCSS plugin wiring.

**Step 3: Migrate provider and overlay APIs**

Update Chakra provider, toast, dialog, modal, popover, tooltip, and input-related components.

**Step 4: Re-run the build**

Run: `pnpm build`
Expected: the extension builds successfully again

### Task 4: Test stack upgrade

**Files:**
- Modify: `vite.config.ts` or create `vitest.config.ts`
- Modify: `test-utils/vitest.setup.js`
- Modify: existing tests under `src/**/*.test.tsx`

**Step 1: Write or update a failing test for the upgraded test runner**

Run: `pnpm test -- --run`
Expected: fails if any old Vitest assumptions are incompatible

**Step 2: Update Vitest configuration and test code**

Adapt config and tests to the latest Vitest runtime.

**Step 3: Verify green**

Run: `pnpm test -- --run`
Expected: passes cleanly

### Task 5: Add Playwright e2e for the extension

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/fixtures/extension.ts`
- Create: `e2e/ui/*.spec.ts`
- Create: `e2e/extension/*.spec.ts`
- Modify: `package.json`

**Step 1: Write the first failing e2e smoke test**

Create a test that expects the built extension to expose the `options` page.

**Step 2: Verify it fails before the fixture is complete**

Run: `pnpm test:e2e`
Expected: fails because the extension fixture/config is not wired yet

**Step 3: Implement the extension fixture and config**

Load the unpacked extension in Chromium and expose the extension id/pages to tests.

**Step 4: Add the first real extension flow**

Cover at least one storage-backed flow through a loaded extension page.

**Step 5: Verify green**

Run: `pnpm test:e2e`
Expected: passes locally

### Task 6: Repository workflow docs

**Files:**
- Create: `agents.md`
- Modify: `README.md`

**Step 1: Document the upgraded repo workflow**

Explain install, lint, unit test, e2e, and extension build commands, plus the key repo conventions that matter for automated agents.

**Step 2: Verify docs against actual commands**

Run: `pnpm lint`
Run: `pnpm test -- --run`
Run: `pnpm build`
Run: `pnpm test:e2e`
Expected: documented commands match reality
