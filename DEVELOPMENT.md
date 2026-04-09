# 项目开发指南 (Project Development Guide)

## 1. 技术栈 (Tech Stack)

- **主框架**: Vue 2.6.14（`src` 与 `domain` 包均使用）
- **Web Components 框架**: Stencil 4.27（`sten-components` 包）
- **构建工具**:
  - Webpack 5 + Vue Loader（`src`、`domain` App 层）
  - Rollup + Babel + Gulp（`base` 工具库）
  - Stencil CLI（`sten-components` 组件库）
  - Gulp + Sass（`theme` 样式库）
- **数据可视化**: D3.js v3.5 + v6.x 双版本共存（`d3-shape` 3.x）
- **其他核心依赖**:
  - `axios` — HTTP 请求
  - `dayjs` — 日期处理
  - `core-js` — ES 特性 polyfill
  - Less — CSS 预处理
- **包管理**: pnpm workspace（monorepo 架构）
- **提交规范**: commitlint + cz-customizable（conventional commits）

## 2. 项目架构 (Project Structure)

```
learnD3/
├── base/            # 公共工具层 → 输出 ESM/CJS 到 dist/
├── theme/           # 样式主题层 → 编译 CSS/Font 到 lib/
├── sten-components/ # Stencil Web Components 库
│   ├── src/components/   # 组件源码（tsx）
│   ├── dist/             # 构建产物
│   └── www/              # 开发服务器
├── domain/          # 领域业务层（Vue 2 + D3）
├── src/             # 应用展示层（Vue 2 + D3）
├── customElement/   # 原生 Custom Elements 实验
├── dev/             # 构建配置集中存放
│   └── build/
│       ├── src/         # src 应用的 webpack 配置
│       └── domain/      # domain 应用的 webpack 配置
└── docs/            # 技术文档
```

### 子包对照表

| 包名 | 技术 | 端口 | 职责 |
|------|------|-----|------|
| `@learnD3/base` | 纯 JS + Rollup | — | 公共工具库（BEM、防抖/节流、DOM 操作、axios 封装） |
| `@learnD3/theme` | SCSS + Gulp | — | 设计令牌与全局样式 |
| `@learnD3/sten-components` | Stencil + TypeScript | 3333 | Web Components 组件库（Button、Icon、Image 等） |
| `@learnD3/domain` | Vue 2 + Webpack + D3 | — | 领域业务组件（温度曲线等可视化组件） |
| `@learnD3/src` | Vue 2 + Webpack + D3 | 9300 | 应用展示与 D3 学习示例 |

### 依赖关系

```
base ──→ sten-components ←── theme
domain ←── base (间接依赖)
src    ←── base (间接依赖)
```

- `sten-components` 同时消费 `@learnD3/base` 和 `@learnD3/theme`
- `theme/lib/index.css` 是 Stencil 的 `globalStyle` 入口
- `dev/build/*` 集中管理 Webpack 配置，而非散落各子包

### 关键目录说明

- **base/utils** — 公共工具函数入口（index.js 统一导出），包含 BEM 类名生成、debounce、throttle、DOM 滚动容器检测等
- **sten-components/src/components** — Web Components 源碼，每个组件独立文件夹，含 `.tsx` + `test/` 目录
- **domain 与 src** — 均挂载到 `#root` DOM 节点，入口均为 `main.js`，各自拥有独立 Webpack dev server

## 3. 核心业务模块 (Business Logic & Modules)

### 3.1 基础工具层 (base)
- **描述**: 纯 JS 工具库，被 `sten-components` 等上层依赖
- **关键文件**: 
  - `base/utils/index.js` — 统一导出入口
  - `base/utils/BEM.js` — CSS 类名 BEM 规范化
  - `base/utils/debounce.js` / `throttled.js` — 函数节流防抖
  - `base/utils/getScrollContainer.js` — 滚动容器检测
  - `base/utils/objectFit.js` — CSS object-fit polyfill
- **逻辑流**: 通过 Rollup 打包为 ESM（`dist/esm`）和 CJS（`dist/cjs`）双格式

### 3.2 样式主题层 (theme)
- **描述**: SCSS 样式与字体资源管理
- **关键文件**:
  - `theme/gulpfile.js` — Gulp 任务：编译 SCSS → CSS → autoprefixer → cssmin
  - `theme/fonts/**` — 字体文件自动拷贝至 `lib/fonts/`
- **逻辑流**: 通过 Gulp 编译所有 SCSS 文件，添加浏览器前缀并压缩，输出到 `lib/index.css`

### 3.3 Web Components 库 (sten-components)
- **描述**: 基于 Stencil 的 Web Components 组件库
- **关键文件**:
  - `stencil.config.ts` — Stencil 配置，含 dist/dist-custom-elements/docs/WWW 输出
  - `src/components/sten-button/` — 按钮组件
  - `src/components/sten-icon/` — 图标组件（含 SVG 自动构建管线）
  - `src/components/sten-image/` — 图片组件
- **图标构建管线**:
  1. `buildSvg` — 将 SVG 文件转为 JSON 数据
  2. `generatorSvg` — 自动生成图标 TSX 组件
- **逻辑流**: Stencil 编译器将 `.tsx` 编译为 Web Components，输出多种格式（dist、dist-custom-elements、ESM、CJS、WWW demo）

### 3.4 领域层 (domain)
- **描述**: 业务领域组件，当前包含温度曲线图
- **关键文件**:
  - `domain/main.js` — 入口文件
  - `domain/App.vue` — Vue 根组件
  - `domain/temperatureChart/index.vue` — 温度曲线组件
  - `domain/temperatureChart/mock/datas.js` — 测试数据
- **逻辑流**: 通过 Webpack dev server 启动，挂载到 `#root`，使用 D3.js 进行数据可视化渲染

### 3.5 应用层 (src)
- **描述**: D3.js 学习与示例应用
- **关键文件**:
  - `src/main.js` — 入口文件，挂载 Vue 实例到 `#root`
  - `src/App.vue` — 根组件（当前为简单占位）
- **逻辑流**: 与 domain 相同的 Webpack 启动方式，独立 dev server（端口 9300）

### 3.6 原生 Custom Elements (customElement)
- **描述**: 原生浏览器自定义元素实验
- **关键文件**:
  - `customElement/test/index.html` — 测试页
  - `customElement/test/registry.js` — 自定义元素注册
  - `customElement/OOPtask/` — 面向对象编程任务示例

## 4. 开发规范 (Conventions)

### 命名规范
- **组件文件夹**: kebab-case（如 `sten-button/`、`temperatureChart/` 混用 PascalCase）
- **工具函数文件**: camelCase（如 `BEM.js`、`debounce.js`）
- **Stencil 组件**: PascalCase + `tsx` 后缀（如 `sten-button.tsx`、`my-component.tsx`）
- **导出文件**: kebab-case 包名前缀（如 `@learnD3/`）
- **图标文件**: camelCase（如 `addImage.js`、`alertCloseCollapse.js`）

### 组件约定
- **Stencil 组件**: 必须包含 `test/` 目录，含 `.e2e.ts`（端到端测试）和 `.spec.ts`（单元测试）
- **Vue 组件**: `.vue` 单文件组件，`main.js` 挂载到 `#root`
- **包命名**: `@learnD3/包名`，workspace 依赖使用 `workspace:*`

### 提交规范
- 使用 `pnpm commit`（cz-customizable 交互式提交）
- 遵循 conventional commits：`feat(范围): 描述`、`fix(范围): 描述`
- Husky 配置了 pre-commit 钩子

### 样式约定
- **BEM 命名法**: 通过 `base/utils/BEM.js` 生成标准化类名
- **浏览器兼容**: 支持 IE > 9、最近 2 个主流版本
- **预处理**: Less（应用层）、SCSS（主题层）双栈
- **全局样式**: `theme/lib/index.css` 通过 Stencil `globalStyle` 注入所有组件
