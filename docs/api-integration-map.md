# Rapid Prototyping AI Studio API Integration Map

本檔對應目前 Hackathon Demo 前端，整理實際上線時要替換的 API 串接點。

## Session Lifecycle

- `GET /api/sessions`: 首次進頁載入 Session History。
- `GET /api/sessions/:id`: 切換 session 時拉最新資料。
- `POST /api/sessions`: 建立新 session（按 `+ New Session`）。
- `PUT /api/sessions/:id`: 離開當前 session 前 autosave（title/transcript/suggestions）。
- `PATCH /api/sessions/:id { title }`: Rename session。
- `DELETE /api/sessions/:id`: 刪除 session（目前 demo 為本地刪除，不 call API）。

## Transcript / Voice

- `POST /api/voice/session`: 開始錄音時向語音服務拿 session/token。
- `WS/SSE /api/voice/stream`: 上傳音訊 chunk，接收即時 STT 文字。
- `POST /api/sessions/:id/transcript`: 新增逐字稿或手動補充內容。
- `PATCH /api/sessions/:id/transcript/:lineId`: 編輯單行逐字稿。

## AI Suggestions

- `POST /api/ai/followups`: 逐字稿更新後生成 3-5 筆追問卡。
- `PATCH /api/sessions/:id/suggestions/:suggestionId`: 更新卡片狀態（adopted/dismissed）。
- `POST /api/sessions/:id/suggestions/:suggestionId/reply`: 快捷回覆寫回 AI context。

## Prototype & Archive

- `POST /api/prototypes/generate`: 點擊 Generate Prototype 生成預覽結果。
- `GET /api/prototypes`: 載入 Prototype Archive 清單。
- `GET /api/prototypes/:id`: 點擊 archive item 還原 prototype 快照。

## Spec Workflow (下一階段)

- `POST /api/specs/generate`: Prototype 確認後產生 PM/UIUX/FE/BE/SA markdown。
- `POST /api/specs/export`: 匯出 PDF/Doc。
