# AI 课后总结助手

一对一辅导老师用来快速生成课后反馈的工具。输入课堂情况，AI 生成结构化的家长反馈，支持流式输出、语音输入、术语修正、一键复制。

**目标用户**：中国一对一教培老师  
**核心指标**：老师是否愿意直接复制结果发给家长

---

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 14 App Router |
| 样式 | Tailwind CSS，白色极简风格 |
| AI | OpenAI 兼容 API（默认 DeepSeek `deepseek-chat`，可切换） |
| 数据库 | Supabase（PostgreSQL） |
| 部署 | Vercel |
| 语言 | 全中文 UI，TypeScript |

---

## 快速开始

```bash
pnpm install
```

复制 `.env.example` 为 `.env.local` 并填入配置：

```
DEEPSEEK_API_KEY=sk-xxx        # AI API 密钥
SUPABASE_URL=https://xxx       # Supabase 项目 URL
SUPABASE_SERVICE_ROLE_KEY=xxx  # Supabase service_role key
ACCESS_PASSWORD=tutor2026      # 页面访问密码
DAILY_QUOTA=200                # 每日总请求上限
RATE_LIMIT_PER_MIN=5           # 每 IP 每分钟上限
```

在 Supabase SQL Editor 中执行 `lib/migrations.sql` 建表。

```bash
pnpm dev          # 开发服务器 → http://localhost:3000
pnpm build        # 生产构建（含 lint + type-check）
```

---

## 项目结构

```
├── app/
│   ├── page.tsx                    # 主页面（home / result / settings 三视图）
│   ├── layout.tsx                  # 根布局（zh-CN）
│   ├── globals.css                 # Tailwind + 动画
│   ├── admin/
│   │   └── page.tsx                # 数据后台（概览 + 详细记录）
│   ├── api/
│   │   ├── generate/route.ts       # POST 流式生成课后反馈（SSE）
│   │   ├── correct/route.ts        # POST AI 修正语音识别错误
│   │   ├── detect-subject/route.ts # POST AI 识别当前教学学科
│   │   ├── log/route.ts            # POST 行为埋点写入 Supabase
│   │   ├── subject-terms/route.ts  # GET/POST/DELETE 学科术语 CRUD
│   │   └── admin/
│   │       ├── stats/route.ts      # GET 今日数据统计
│   │       ├── records/route.ts    # GET 分页生成记录
│   │       └── reset/route.ts      # GET 重置配额 / POST 清空数据库
│   └── components/
│       ├── Header.tsx              # 顶部标题栏 + 设置入口
│       ├── InputArea.tsx           # 多行输入框 + 作业/下节课选填
│       ├── VoiceAIButtons.tsx      # 语音输入 + 术语一键替换按钮
│       ├── SmartEnhanceBadge.tsx   # 首页学科术语增强徽章（可展开）
│       ├── GenerateButton.tsx      # 底部固定生成按钮（含 loading 动画）
│       ├── ResultView.tsx          # 结果展示（解析 **标题** 分卡片显示）
│       ├── QuickActions.tsx        # 快捷修改按钮 + 自定义修改意见
│       ├── FeedbackCard.tsx        # 反馈卡片（课堂内容/表现/作业/计划）
│       ├── SettingsPage.tsx        # 设置页（学生姓名、术语管理、API 配置）
│       ├── SettingsPanel.tsx       # 通用设置面板容器
│       ├── SubjectTermsManager.tsx # 学科术语管理器（下拉 + 自动保存）
│       ├── PasswordGate.tsx        # 密码门组件
│       ├── Toast.tsx               # 底部 Toast 通知
│       ├── AdminStats.tsx          # 数据概览仪表盘
│       └── AdminRecords.tsx        # 详细记录表格（分页、展开、CSV 导出）
├── lib/
│   ├── openai.ts                  # AI 客户端工厂（支持多模型切换）
│   ├── prompt.ts                  # 系统 Prompt + 修订 Prompt
│   ├── ratelimit.ts               # 内存版 IP 限流 + 日配额
│   ├── supabase.ts                # Supabase admin 客户端（单例）
│   ├── analytics.ts               # 前端埋点（client-side）
│   ├── speech.d.ts                # Web Speech API 类型声明
│   └── migrations.sql             # 数据库建表 SQL（参考用）
├── .env.example                   # 环境变量模板
├── vercel.json                    # Vercel 部署配置
└── CLAUDE.md                      # AI 辅助开发指南
```

---

## 架构

### 数据流

```
用户输入课堂情况
    │
    ├─→ /api/detect-subject ──→ AI 识别学科 ──→ 更新首页学科标签
    │
    ├─→ /api/correct ──→ AI 修正语音识别错误
    │                       └── 从 Supabase 拉取当前学科的术语词库
    │
    └─→ /api/generate ──→ AI 流式生成课后反馈（SSE）
                              │
                              ├── 前端逐字渲染
                              ├── 支持快捷修改（重新生成新版本）
                              └── 最多 5 个版本
```

### 分析埋点

```
用户行为 ──→ analytics.ts ──→ /api/log ──→ Supabase
                                            ├── generation_logs（生成记录）
                                            └── action_logs（行为流水）
```

所有 analytics 调用是 fire-and-forget（不阻塞 UI）。

### 多模型支持

`lib/openai.ts` 的 `createClient(userKey?, baseUrl?)` 工厂函数：
- **默认**使用服务端 `DEEPSEEK_API_KEY`
- 用户在设置页填入自己的 API Key → 通过 `x-user-api-key` header 传递
- 同时可切换 `x-api-base` 和 `x-model`，兼容所有 OpenAI 接口的模型

预设模型：DeepSeek / OpenAI / 智谱 GLM / 通义千问 / Moonshot

---

## API 路由一览

| 路由 | 方法 | 说明 | 流式 | 限流 | 密码 |
|---|---|---|---|---|---|
| `/api/generate` | POST | 生成课后反馈 | SSE | IP + 日配额 | — |
| `/api/correct` | POST | AI 修正语音识别文本 | — | IP + 日配额 | — |
| `/api/detect-subject` | POST | AI 识别学科 | — | — | — |
| `/api/log` | POST | 行为埋点入库 | — | — | — |
| `/api/subject-terms` | GET/POST/DELETE | 学科术语 CRUD | — | — | — |
| `/api/admin/stats` | GET | 今日数据统计 | — | — | — |
| `/api/admin/records` | GET | 分页查询生成记录 | — | — | — |
| `/api/admin/reset` | GET/POST | 重置配额 / 清空数据库 | — | — | — |

---

## 数据库

三张表，均在 Supabase PostgreSQL 中，RLS 开启（仅 service_role 有权限）：

### `generation_logs` — 生成记录

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | BIGSERIAL | 主键 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `input_text` | TEXT | 用户原始输入 |
| `input_length` | INT | 输入字数 |
| `used_voice` | BOOLEAN | 是否使用语音输入 |
| `output_text` | TEXT | 最终输出文本 |
| `generation_ms` | INT | 生成耗时（毫秒） |
| `copied` | BOOLEAN | 是否已复制 |
| `iteration_count` | INT | 修改次数（0 = 首次生成直接复制） |
| `completed` | BOOLEAN | 是否生成完成 |

### `action_logs` — 行为流水

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | BIGSERIAL | 主键 |
| `generation_id` | BIGINT | 关联的生成记录（可空） |
| `action_type` | TEXT | 行为类型（generate / copy / add_encourage / voice_start 等） |
| `metadata` | JSONB | 扩展信息（修改意见、语音时长等） |
| `created_at` | TIMESTAMPTZ | 创建时间 |

### `subject_terms` — 学科术语

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | BIGSERIAL | 主键 |
| `subject` | TEXT | 学科名称（数学/物理/化学/英语/语文/历史/地理/生物/政治） |
| `terms` | TEXT | 术语列表（每行一个） |
| `updated_at` | TIMESTAMPTZ | 最后更新时间 |

---

## 关键约定

- **中文 UI**：所有面向用户的文案用中文
- **无注释原则**：代码默认不写注释，只在 WHY 不显然时加一行短注释
- **组件即文件**：每个 React 组件一个文件，`"use client"` 在首行
- **类型局部化**：接口/类型定义在使用它们的文件中，不单独导出
- **无状态库**：纯 React `useState` + `useRef` + `localStorage`
- **静默失败**：非关键路径（埋点、术语加载）失败时静默，不阻塞用户
- **`as never`**：Supabase 插入操作因类型不匹配使用 `as never` 绕过，可接受
- **幂等迁移**：SQL 全用 `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`，可重复执行

---

## 已知限制

- **限流是内存版的**：Vercel serverless 多实例间不共享计数，高并发下可能被绕过。应升级为 Upstash Redis
- **无测试**：当前无单元测试或 E2E 测试
- **部分 API 无鉴权**：`detect-subject`、`log`、`subject-terms`、`admin/*` 未加密码校验
- **Windows 开发注意**：`.next` 缓存可能因文件锁损坏，用 `pnpm dev:clean` 或删除 `.next` 后重启

---

## 部署

推送到 GitHub 后，Vercel 自动部署。需在 Vercel 项目设置中配置以下环境变量：

- `DEEPSEEK_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ACCESS_PASSWORD`
- `DAILY_QUOTA`（可选，默认 200）
- `RATE_LIMIT_PER_MIN`（可选，默认 5）

`vercel.json` 已配置好 `framework: "nextjs"`，无需额外设置。
