import type {
  FollowupSuggestion,
  Session,
  SpecMap,
  TranscriptEntry,
} from "@/lib/studio-types";

export const initialTranscript: TranscriptEntry[] = [
  {
    id: "line-1",
    speaker: "Interviewer",
    text: "我們先聚焦 MVP，目標是 3 分鐘內從訪談生成第一版 wireframe。",
    timestamp: "09:41",
  },
  {
    id: "line-2",
    speaker: "Founder",
    text: "希望能同時輸出 PM 跟 Frontend 都看得懂的規範摘要。",
    timestamp: "09:42",
  },
  {
    id: "line-3",
    speaker: "Interviewer",
    text: "先支援 dashboard 與 auth flow，後續再加多人協作。",
    timestamp: "09:43",
  },
];

export const aiSuggestions: FollowupSuggestion[] = [
  {
    id: "sug-1",
    question: "第一版 Prototype 要優先支援 Desktop、Mobile 還是兩者同時？",
    status: "pending",
  },
  {
    id: "sug-2",
    question: "Spec 匯出格式目前以 Markdown 為主，是否需要同步產出 PDF？",
    status: "pending",
  },
  {
    id: "sug-3",
    question: "是否要在 Session 中標註高風險需求與技術限制？",
    status: "pending",
  },
];

export const sessions: Session[] = [
  {
    id: "session-1",
    title: "SaaS Onboarding Flow 訪談",
    createdAt: "2026-09-05T09:43:00.000Z",
    transcriptHistory: initialTranscript,
    aiSuggestions,
  },
  {
    id: "session-2",
    title: "Marketplace MVP Discovery",
    createdAt: "2026-09-04T16:10:00.000Z",
    transcriptHistory: [],
    aiSuggestions: [],
  },
  {
    id: "session-3",
    title: "Design System Audit",
    createdAt: "2026-09-01T08:20:00.000Z",
    transcriptHistory: [],
    aiSuggestions: [],
  },
];

export const mockSpecs: SpecMap = {
  pm: `# PRD - Rapid Prototyping AI Studio

## Product Goal
- 在 3 分鐘內從語音訪談生成可檢視 prototype 與跨職能 spec。

## User Stories
1. 作為 PM，我希望快速捕捉需求訪談並得到可驗證的原型。
2. 作為 Frontend，我希望拿到可落地的元件拆分與狀態規劃。
3. 作為 Founder，我希望在 demo 中即時修改並重新生成方向。

## MVP Scope
- Session 管理與逐字稿編輯
- AI Follow-up 建議採納/忽略
- Prototype 預覽（Desktop/Mobile）
- 多角色 Spec 生成與複製`,
  uiux: `# UI/UX Spec

## Design Tokens
- Base: #090D16
- Surface: glass panel (slate-900/60 + blur + border)
- Accent: Indigo (#6366F1) / Violet (#8B5CF6)

## User Flow
1. New Session
2. Voice/Transcript input
3. AI follow-up convergence
4. Generate prototype
5. Confirm and enter spec tabs

## Responsive Breakpoints
- Desktop >= 1280: 三欄主版
- Tablet >= 1024: 兩欄
- Mobile < 1024: 區塊堆疊 + drawer`,
  frontend: `# Frontend Architecture

## Component Tree
- app/page.tsx
  - Sidebar
  - SessionHeader
  - VoiceInput
  - TranscriptStream
  - FollowupCards
  - PrototypeModal
    - SpecViewer

## State Management
- local React state（hackathon demo）
- 後續可抽離為 session store + api service layer

## Tailwind Conventions
- glass panel 統一使用 .glass-panel
- 高互動按鈕統一使用 Button variant`,
  backend: `# Backend Interface Draft

## REST Endpoints
- GET /api/sessions
- POST /api/sessions
- PUT /api/sessions/:id
- POST /api/prototypes/generate
- POST /api/specs/generate

## Data Entities
- Session(id, title, createdAt)
- TranscriptEntry(id, sessionId, speaker, text, timestamp)
- Suggestion(id, sessionId, question, status)
- Prototype(id, sessionId, snapshot, createdAt)`,
  sa: `# System Architecture

## Diagram
\`\`\`mermaid
flowchart LR
  UI[Next.js Frontend] --> API[App API Layer]
  API --> STT[Voice/STT Provider]
  API --> LLM[LLM Orchestrator]
  API --> DB[(Session Store)]
\`\`\`

## Security
- 語音 token 短效化
- Session API 加上 auth middleware
- 匯出檔案做簽名 URL 與時效控制

## Integrations
- STT provider
- LLM provider
- Analytics events`,
};

export const mockMeetingTranscriptResponse = {
  round: 0,
  created_at: "2026-09-05T07:37:08.943Z",
  path: "mock://meetings/2026_09_05_1530_AB12CD/transcript",
  verified_count: 1,
  questions: [
    {
      entry_id: "TKT-002",
      question:
        "你提到要看毛利。寄杯券售出時認列為合約負債，此時點沒有成本可對應，要改看核銷後毛利嗎？",
      trace: "verified",
      confidence: "low",
      downgraded: true,
      verdict: "blocked",
      axis: "sys",
      origin: "accounting",
      fact: "預收性質的寄杯款在售出時認列為合約負債，履約義務尚未滿足。",
      impact: "任何以「售出」為時點的損益欄位在此資料層級無法計算。",
      source_ref: "SRC-002",
      source: {
        title: "IFRS 15 客戶合約之收入",
        locator: "待填",
        status: "unverified",
      },
      note: "此條目的出處尚未查證，信心等級已降級。",
    },
    {
      entry_id: "TKT-003",
      question:
        "若要看門市貢獻，是否要拆成銷售時點 KPI 與核銷時點 KPI 兩套儀表板？",
      trace: "verified",
      confidence: "medium",
      downgraded: false,
      verdict: "open",
      axis: "biz",
      origin: "analytics",
      fact: "同一筆交易在不同認列時點會得到不同經營意義。",
      impact: "若 KPI 不拆分，可能誤判店效或促銷成效。",
      source_ref: "SRC-003",
      source: {
        title: "Management Reporting Guideline",
        locator: "Section 4.2",
        status: "verified",
      },
      note: "建議與財會及營運共同對齊。",
    },
    {
      entry_id: "TKT-004",
      question:
        "你希望 Follow-up 問題依風險等級排序，還是依產品流程（訪談 -> 設計 -> 開發）排序？",
      trace: "verified",
      confidence: "high",
      downgraded: false,
      verdict: "open",
      axis: "product",
      origin: "workflow",
      fact: "排序策略會影響決策節奏與使用者注意力。",
      impact: "未定義排序可能讓高風險議題被延後處理。",
      source_ref: "SRC-004",
      source: {
        title: "Product Discovery Playbook",
        locator: "Chapter 2",
        status: "verified",
      },
      note: "可先以風險優先，後續再提供切換。",
    },
  ],
};
