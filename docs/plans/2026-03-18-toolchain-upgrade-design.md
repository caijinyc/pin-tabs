# PinTabs Toolchain Upgrade Design

## Goal

Upgrade the project to a current frontend toolchain with the following outcomes:

- replace `typescript` CLI checks with `tsgo`
- replace `eslint + prettier` with `oxlint`
- replace `vite + rollup` dev/build workflow with `vite` on top of `rolldown-vite`
- upgrade the core runtime/testing stack to current major versions where the project can reasonably absorb the change
- add first-class e2e coverage for the browser extension
- document the repository workflow in `agents.md`

## Current Constraints

- The project is a multi-entry MV3 browser extension, not a regular SPA.
- Development HMR currently depends on a custom `rollup` watcher and websocket injection flow.
- Chakra UI is used across `newtab`, `options`, and some shared dialogs, so UI-library upgrades affect a wide surface area.
- The worktree already contains partial dependency churn (`.nvmrc`, `pnpm-lock.yaml`), so the implementation should converge the existing state instead of resetting it.

## Recommended Design

### 1. Build and Dev Pipeline

Keep Vite as the external interface, but switch the dependency from upstream Vite to `rolldown-vite` through an npm alias. This preserves the existing config/import shape (`import { defineConfig } from 'vite'`) while moving bundling to Rolldown. The custom extension plugins remain in place, but the separate `rollup` dependency and `build:hmr` pipeline should be removed if the dev workflow can be expressed through the Vite watch/build path alone.

### 2. Type Checking

Replace direct `tsc --noEmit` script usage with `tsgo --noEmit`. The package choice is `@typescript/native-preview`, which currently exposes the `tsgo` binary. TypeScript stays as a language dependency only if another tool still requires its package metadata or types; otherwise the CLI role moves to `tsgo`.

### 3. Lint and Formatting

Remove `eslint`, its plugin stack, and `prettier`. Add `oxlint` as the single lint entrypoint and use a lightweight repository config to cover TypeScript, React, import hygiene, and unused code. Since `oxlint` is not a formatter, the repository should explicitly stop advertising formatting scripts.

### 4. Styling

Upgrade Tailwind to v4 and move CSS entry files from `@tailwind ...` directives to the v4 import form. Keep the migration minimal by preserving existing utility classes and only changing the config surface that v4 actually requires.

### 5. UI and State

Upgrade Chakra UI and Zustand to their current majors, then adapt the project to the new provider/component APIs with the smallest possible compatibility layer. Because Chakra UI is the most likely source of breaking changes, the migration should centralize provider setup and shared overlay/toast utilities instead of scattering one-off fixes.

### 6. Testing

Keep unit/integration tests on Vitest and add Playwright for e2e. The e2e strategy is hybrid:

- smoke coverage for extension entry pages
- real extension coverage by loading the built unpacked extension in Chromium

The first milestone should cover:

- extension bootstraps successfully
- `options` page opens
- `newtab` page opens
- one storage-backed flow works end to end

## Risks

- Chakra UI v3 may require non-trivial component migrations for dialog, modal, popover, toast, and provider setup.
- Rolldown compatibility may surface plugin edge cases in the custom extension build plugins.
- `tsgo` is still preview software, so script wiring should stay simple and observable.
- Tailwind v4 may break class generation if content scanning assumptions change.

## Validation

- run unit tests with Vitest
- run oxlint on the repository
- run production build
- run Playwright smoke/extension e2e
- manually inspect generated extension outputs and manifest paths
