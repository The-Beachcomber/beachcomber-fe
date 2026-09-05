/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 15:58:19
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-05 15:58:30
 * @FilePath: /beachcomber-fe/lib/api/session.ts
 */
import type { FollowupSuggestion, TranscriptEntry } from "@/lib/studio-types";

type UpdateSessionPayload = {
  sessionId: string;
  title: string;
  transcriptHistory: TranscriptEntry[];
  aiSuggestions: FollowupSuggestion[];
};

export async function fetchSessionById(sessionId: string) {
  // API TODO: GET /api/sessions/:id
  return Promise.resolve({ ok: true, sessionId });
}

export async function createSession(payload: {
  title: string;
  createdAt: string;
}) {
  // API TODO: POST /api/sessions
  return Promise.resolve({ ok: true, ...payload });
}

export async function updateSession(payload: UpdateSessionPayload) {
  // API TODO: PUT /api/sessions/:id
  return Promise.resolve({ ok: true, ...payload });
}

export async function renameSession(payload: {
  sessionId: string;
  title: string;
}) {
  // API TODO: PATCH /api/sessions/:id { title }
  return Promise.resolve({ ok: true, ...payload });
}

export async function deleteSessionById(sessionId: string) {
  // API TODO: DELETE /api/sessions/:id
  return Promise.resolve({ ok: true, sessionId });
}

export async function appendTranscriptLine(payload: {
  sessionId: string;
  line: TranscriptEntry;
}) {
  // API TODO: POST /api/sessions/:id/transcript
  return Promise.resolve({ ok: true, ...payload });
}

export async function updateTranscriptLine(payload: {
  sessionId: string;
  lineId: string;
  text: string;
}) {
  // API TODO: PATCH /api/sessions/:id/transcript/:lineId
  return Promise.resolve({ ok: true, ...payload });
}

export async function updateSuggestionStatus(payload: {
  sessionId: string;
  suggestionId: string;
  status: "adopted" | "dismissed";
}) {
  // API TODO: PATCH /api/sessions/:id/suggestions/:suggestionId
  return Promise.resolve({ ok: true, ...payload });
}
