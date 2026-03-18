# Pin Tabs Agent Guide

## 项目概览

- 这是一个基于 Manifest V3 的浏览器扩展，核心入口位于 `src/pages/background`、`src/pages/newtab`、`src/pages/options`、`src/pages/popup`。
- `newtab` 是主工作区页面，状态管理集中在 `src/pages/newtab/store`，大量交互直接依赖 `chrome.tabs`、`chrome.tabGroups`、`chrome.storage`。
- `dist/` 是本地构建产物，`release/` 是仓库内保留的可发布产物镜像。除非在处理构建链路，否则不要手改这两个目录里的文件。

## 环境与工具链

- Node 版本以 `.nvmrc` 为准，当前为 `24.12.0`。
- 包管理器使用 `pnpm@10.16.1`。
- TypeScript 类型检查已经切到 `tsgo`，命令是 `pnpm typecheck`。
- 构建使用 `rolldown-vite`，包名仍然通过 `vite` script 暴露。
- CSS 基础设施使用 Tailwind CSS 4 和 `@tailwindcss/postcss`。
- 静态检查使用 `oxlint`，仓库已经移除 ESLint 和 Prettier。
- 单元测试使用 Vitest 4，e2e 使用 Playwright。

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm test:e2e:headed
pnpm test:e2e:install
```

## 目录约定

- `src/pages/*`：扩展各入口页面。
- `src/shared/*`：跨页面复用的存储、hooks、UI 封装。
- `utils/reload/*`：开发态扩展热更新相关逻辑。
- `e2e/ui/*`：页面级 smoke 测试。
- `e2e/extension/*`：加载真实扩展后的集成测试。
- `e2e/fixtures/extension.ts`：Playwright 扩展夹具，负责加载 `dist/` 下的 unpacked extension。

## 开发注意事项

- 先改 `src/`，再通过构建同步到 `release/`；不要反向编辑构建产物。
- Zustand 5 对 selector 稳定性更敏感。凡是 selector 内部会新建数组或对象的场景，优先使用 `useShallow` 或拆成稳定 selector，避免在 React 19 下触发无限重渲染。
- Chakra UI 已升级到 v3。旧版的 `useToast`、`Tooltip`、`Popover`、`AlertDialog` API 不能直接照搬，优先复用 `src/shared/ui` 里的轻量封装。
- `newtab` 依赖真实浏览器扩展环境，涉及 `chrome.*` API 的行为优先通过 Playwright 扩展测试验证，不要只依赖 jsdom。
- Tailwind 4 使用 `@import "tailwindcss";`，不要再添加旧版 `@tailwind` 指令组合。

## 验证顺序

- 纯代码改动默认先跑 `pnpm typecheck`、`pnpm lint`、`pnpm test`。
- 影响扩展入口、路由、存储或 `chrome.*` API 时，再补跑 `pnpm test:e2e`。
- 若 e2e 失败，优先检查 `pageerror`、`console` 和 `test-results/` 里的截图/trace，再决定是否修改实现。

## 变更原则

- 以最小、可审阅的修改为主，不要顺手重写整个入口页面。
- 保持 MV3 多入口结构，不要把 `newtab`、`popup`、`options` 的运行时耦合到一起。
- 对构建链路的改动必须同时验证 `pnpm build` 与至少一条 e2e 用例，避免产物可编译但扩展运行时白屏。
