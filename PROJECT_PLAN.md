# AI 课后总结助手 — 项目方案

> 教培老师版 · MVP · 单页应用

---

## 一、项目目标

帮助一对一理科老师在课后 **30 秒内**生成专业的家长反馈，减少重复劳动，提升专业感。

**第一阶段唯一成功指标**：老师是否愿意直接复制结果发给家长。

---

## 二、技术栈

| 项目 | 选择 | 说明 |
|------|------|------|
| 框架 | Next.js 14（App Router） | 同仓库前后端，部署最简 |
| 样式 | TailwindCSS | 极简白色风格 |
| AI 服务 | **DeepSeek**（`deepseek-chat`） | 兼容 OpenAI SDK，中文好，成本约 ¥1/百万 token |
| SDK | `openai` npm 包 | 改 `baseURL` 即可调用 DeepSeek |
| 部署 | Vercel | 一键部署 |
| 包管理 | pnpm | 比 npm 快 |
| 项目路径 | `E:\ai-tutor-summary\` | 独立目录 |

---

## 三、核心功能（P0）

1. **输入**：多行输入框，支持手动输入/粘贴，placeholder "输入今天课堂情况…"
2. **生成**：按钮"生成课后总结" → 调用 DeepSeek API
3. **输出**：流式逐字显示，按固定结构呈现
4. **复制**：一键复制到剪贴板，按钮反馈"已复制 ✓"

**输出结构**：
```
【今日内容】
【课堂表现】
【存在问题】
【后续建议】
```

**输出要求**：语言专业自然 · 不机械化 · 不夸张 · 不批评学生 · 强调进步 · 150~250 字

---

## 四、页面设计

- 单页应用，移动端优先
- 白色背景，类似 Notion 风格
- 中文 UI
- 响应式布局

**布局结构**：
```
┌─────────────────────────┐
│   AI 课后总结助手        │  ← 标题
├─────────────────────────┤
│                         │
│   [多行输入框]           │  ← 输入区
│                         │
├─────────────────────────┤
│   [生成课后总结]         │  ← 按钮（全宽，移动端友好）
├─────────────────────────┤
│                         │
│   [输出区域 / 流式显示]   │
│                         │
├─────────────────────────┤
│        [复制]            │
└─────────────────────────┘
```

---

## 五、流式输出说明

**非流式**：点按钮 → 转圈 8 秒 → 整段蹦出
**流式**：点按钮 → 立即逐字显示 → 用户边读边等

技术：HTTP `text/event-stream` 持续推送 token。
体感差异大，本项目**采用流式**。

---

## 六、防滥用策略（使用作者 key）

| 措施 | 实现 | 防什么 |
|------|------|--------|
| 输入长度限制 | 前后端均校验 ≤500 字 | 长输入烧钱 |
| 输出长度限制 | `max_tokens: 500` | 输出失控 |
| IP 频率限制 | 每 IP 每分钟 5 次 | 单人刷接口 |
| 全局日配额 | 每日总请求 ≤200 次，超限友好提示 | 大规模滥用 |
| 密码门 | 进入页面需输入口令（环境变量配置） | 防陌生人 |
| 关键词过滤 | 拒绝明显与"课后总结"无关的输入 | 防当通用 ChatGPT 用 |

**MVP 采用组合**：长度限制 + IP rate limit + 日配额 + 密码门

---

## 七、Prompt 设计

### 系统 Prompt

```
你是一名专业的一对一家教教师助手。

你的任务是：
根据老师提供的课堂描述，生成一份适合发送给家长的课后反馈。

要求：
1. 语言专业自然
2. 不要机械化
3. 不要夸张吹捧
4. 不要直接批评学生
5. 强调学生进步
6. 指出需要提升的问题
7. 给出后续学习建议
8. 控制在 150~250 字
9. 使用以下结构：

【今日内容】
【课堂表现】
【存在问题】
【后续建议】
```

---

## 八、项目结构

```
E:\ai-tutor-summary\
├── app/
│   ├── page.tsx              # 唯一页面（输入+输出+复制）
│   ├── layout.tsx            # 根布局，中文 lang
│   ├── globals.css           # Tailwind 入口
│   └── api/
│       └── generate/
│           └── route.ts      # POST /api/generate，调用 DeepSeek（流式）
├── lib/
│   ├── prompt.ts             # 系统 Prompt 常量
│   └── ratelimit.ts          # IP 频率限制 + 日配额
├── .env.local                # DEEPSEEK_API_KEY + ACCESS_PASSWORD（不入 git）
├── .env.example              # 示例
├── .gitignore
├── tailwind.config.ts
├── package.json
├── PROJECT_PLAN.md           # 本文件
└── README.md                 # 部署说明
```

---

## 九、API 调用代码骨架

```ts
// app/api/generate/route.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(req: Request) {
  // 1. 校验密码门
  // 2. 校验输入长度
  // 3. IP rate limit 检查
  // 4. 全局日配额检查
  // 5. 调用 deepseek-chat，stream: true
  // 6. 返回 text/event-stream
}
```

---

## 十、用户流程

```
进入页面 → 输入密码 → 输入课堂情况 → 点击生成
  → 流式显示结果 → 点击复制 → 粘贴到微信发送家长
```

---

## 十一、开发步骤与工时

| # | 任务 | 预计 |
|---|------|------|
| 1 | `pnpm create next-app` + Tailwind 配置 | 10 min |
| 2 | 写 `lib/prompt.ts` | 5 min |
| 3 | 写 `lib/ratelimit.ts`（内存版即可） | 15 min |
| 4 | 写 `app/api/generate/route.ts`（含流式 + 防护） | 30 min |
| 5 | 写 `app/page.tsx`（输入+按钮+输出+复制+密码门） | 40 min |
| 6 | 本地测试，调 Prompt 风格 | 30 min |
| 7 | 推 GitHub → Vercel 导入 → 配环境变量 → 部署 | 15 min |

**总计约 2.5 小时上线 MVP**

---

## 十二、环境变量

`.env.local`（不入 git）：

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
ACCESS_PASSWORD=tutor2026
DAILY_QUOTA=200
RATE_LIMIT_PER_MIN=5
```

---

## 十三、明确不做（第一版）

- ❌ 登录注册 / 用户系统
- ❌ 数据库 / 历史记录
- ❌ 支付
- ❌ 多角色 / 多页面
- ❌ AI Agent / 长期记忆
- ❌ 教务管理
- ❌ 语音输入（P1）
- ❌ 家长版/学生版切换（P1）
- ❌ 风格选择（P1）

---

## 十四、待提供信息

开工前还需要你确认：

1. **DeepSeek API Key**：是否已有？没有先去 https://platform.deepseek.com 申请
2. **访问密码**：默认 `tutor2026`，是否需要换？
3. **域名**：先用 Vercel 默认子域名，还是绑定自定义域名？

---

## 十五、后续迭代（P1，验证后再做）

- 语音输入（科大讯飞 / Whisper）
- 家长版 / 学生版风格切换
- 历史记录（localStorage 即可，无需数据库）
- 一键调整语气（更专业 / 更亲切）
- 模板库（不同学科预设）
