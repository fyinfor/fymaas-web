# fymaas UI

[fymaas](https://github.com/fyinfor/fymaas) 的前端，私有下游自 [gpustack/gpustack-ui](https://github.com/gpustack/gpustack-ui)。

Frontend for [fymaas](https://github.com/fyinfor/fymaas). Private downstream of [gpustack/gpustack-ui](https://github.com/gpustack/gpustack-ui).

## Installation

1. [Nodejs](https://nodejs.org/en) 16.0+(with NPM)

If you're on Mac

```
brew install node
```

2. [pnpm](https://pnpm.io/installation#using-npm)

```
npm install -g pnpm
```

3. Setup

```
git clone https://github.com/fyinfor/fymaas-web.git
```

4. Install dependencies

```
cd fymaas-web
pnpm install
```

## Usage

1. Run development server (at http://localhost:9000)

```
npm run dev
```

2. build release

```
npm run build
```

## 从官方 GPUStack UI 同步

本仓库是 [gpustack/gpustack-ui](https://github.com/gpustack/gpustack-ui) 的私有下游副本，不是 GitHub Fork，因此没有网页上的 Sync fork 按钮，需要用 `upstream` 手动拉官方更新。

| 远程 | 地址 | 用途 |
| --- | --- | --- |
| `origin` | `https://github.com/fyinfor/fymaas-web.git` | 本仓库，日常推送这里 |
| `upstream` | `https://github.com/gpustack/gpustack-ui.git` | 官方源，只 fetch / merge，不要 push |

本地如果还没有 `upstream`：

```bash
git remote add upstream https://github.com/gpustack/gpustack-ui.git
git remote -v
```

### 同步 main

```bash
git fetch upstream
git checkout main
git merge upstream/main
# 如有冲突，解决后：git add ... && git commit
git push origin main
```

更想保持线性历史时可以用 rebase，但已推送的 `main` 需要团队配合，一般用 merge 即可：

```bash
git fetch upstream
git checkout main
git rebase upstream/main
git push origin main
```

### 同步官方其他分支

官方还有 `dev`、`v0.7-dev`、`v2.0-dev`、`v2.1-dev`、`v2.2-dev` 等。以 `v2.2-dev` 为例：

```bash
git fetch upstream
git checkout v2.2-dev
# 本地没有该分支时：git checkout -B v2.2-dev origin/v2.2-dev
git merge upstream/v2.2-dev
git push origin v2.2-dev
```

### 只合入某个官方 tag 或提交

```bash
git fetch upstream --tags
git checkout main
git merge v2.2.3          # 或某个 commit SHA
git push origin main
```

### CI / 产物

- `main` / `v*-dev` / tag 推送后，本仓库的 GitHub Actions 会独立构建 UI，并发布到本仓库 Release，tag 为 `ui-<version>`（`main` 对应 `ui-latest`）。
- 前端 CICD 不触发后端；后端 Pack 在 `fyinfor/fymaas` 仓库独立运行。

### 注意

- 本仓库已把对外项目名改成 fymaas。合并官方更新时，`README.md`、`package.json`、页面标题和文案容易冲突：保留本仓库的 fymaas 命名，只合入功能与修复。
- 不要执行 `git push upstream`。
- 插件标识（`getGPUStackPlugin`、`GPUStackPluginManager`）、`X-GPUStack-*` 协议头、`@gpustack/core-ui` 等上游依赖不要改回去。
- 合并后再跑相关验证，确认无误再推到 `origin`。

## Sync from Official GPUStack UI

This repository is a private downstream of [gpustack/gpustack-ui](https://github.com/gpustack/gpustack-ui), not a GitHub fork. There is no Sync fork button; pull official updates through `upstream`.

| Remote | URL | Purpose |
| --- | --- | --- |
| `origin` | `https://github.com/fyinfor/fymaas-web.git` | This repo. Push here. |
| `upstream` | `https://github.com/gpustack/gpustack-ui.git` | Official source. Fetch / merge only. Do not push. |

If `upstream` is missing locally:

```bash
git remote add upstream https://github.com/gpustack/gpustack-ui.git
git remote -v
```

### Sync `main`

```bash
git fetch upstream
git checkout main
git merge upstream/main
# Resolve conflicts, then: git add ... && git commit
git push origin main
```

### Sync other official branches

```bash
git fetch upstream
git checkout v2.2-dev
# If the branch does not exist locally: git checkout -B v2.2-dev origin/v2.2-dev
git merge upstream/v2.2-dev
git push origin v2.2-dev
```

### Notes

- Keep the fymaas naming and take functional changes from upstream.
- Do not run `git push upstream`.
- Leave plugin identifiers, `X-GPUStack-*` headers, and `@gpustack/core-ui` unchanged.

## Bugs & Issues

- Please submit [bugs and issues](https://github.com/fyinfor/fymaas/issues) with a label `ui`

## Links

- Backend: https://github.com/fyinfor/fymaas
- Official GPUStack UI: https://github.com/gpustack/gpustack-ui
- Official website: https://gpustack.ai/
- Documents: https://docs.gpustack.ai/latest/overview/
