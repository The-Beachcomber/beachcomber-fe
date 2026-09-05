"use client";

import { FollowupCards } from "@/components/ai/FollowupCards";
import { SessionHeader } from "@/components/interview/SessionHeader";
import { TranscriptStream } from "@/components/interview/TranscriptStream";
import { VoiceInput } from "@/components/interview/VoiceInput";
import { Sidebar } from "@/components/layout/Sidebar";
import { PrototypeModal } from "@/components/prototype/PrototypeModal";
import { Button } from "@/components/ui/button";
import { sessions as sessionMock } from "@/lib/mock-data";
import type {
  FollowupSuggestion,
  Session,
  TranscriptEntry,
} from "@/lib/studio-types";
import { useMemo, useState } from "react";

const prototypeArchive = [
  {
    id: "p-1",
    title: "Version A - Dashboard Focus",
    createdAt: "2026-09-05 10:42",
  },
  {
    id: "p-2",
    title: "Version B - Mobile First",
    createdAt: "2026-09-04 19:15",
  },
];

const AUTO_TITLE_PATTERNS = [
  /^Unsaved Interview Session$/,
  /^New Session #\d+$/,
];

function buildNewSessionTitle(list: Session[]) {
  return `New Session #${String(list.length + 1).padStart(2, "0")}`;
}

function isAutoManagedTitle(title: string) {
  return AUTO_TITLE_PATTERNS.some((pattern) => pattern.test(title));
}

function buildSummaryTitle(items: TranscriptEntry[]) {
  const combined = items
    .map((entry) => entry.text.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");

  if (!combined) {
    return null;
  }

  const normalized = combined.replace(/^追問補充：/g, "").trim();
  const firstSentence =
    normalized.split(/[。！？.!?]/)[0]?.trim() ?? normalized;
  const clipped = firstSentence.slice(0, 22);
  return clipped || null;
}

export default function Home() {
  // API TODO: replace mock bootstrapping with GET /api/sessions + GET /api/prototypes
  const [sessions, setSessions] = useState<Session[]>(sessionMock);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionMock[0]?.id ?? null,
  );
  const [sessionTitle, setSessionTitle] = useState(
    sessionMock[0]?.title ?? "Unsaved Interview Session",
  );
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(
    sessionMock[0]?.transcriptHistory ?? [],
  );
  const [suggestions, setSuggestions] = useState<FollowupSuggestion[]>(
    sessionMock[0]?.aiSuggestions ?? [],
  );
  const [focusSignal, setFocusSignal] = useState(0);
  const [isPrototypeOpen, setIsPrototypeOpen] = useState(false);
  const [prototypeModalSeed, setPrototypeModalSeed] = useState(0);

  const wordCount = useMemo(
    () =>
      transcript
        .map((line) => line.text.trim())
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length,
    [transcript],
  );

  const setActiveTitle = (nextTitle: string) => {
    const title = nextTitle.trim() || "Unsaved Interview Session";
    setSessionTitle(title);
    if (!activeSessionId) {
      return;
    }
    setSessions((prev) =>
      prev.map((item) =>
        item.id === activeSessionId ? { ...item, title } : item,
      ),
    );
  };

  const maybeAutoRenameByTranscript = (nextTranscript: TranscriptEntry[]) => {
    if (!isAutoManagedTitle(sessionTitle)) {
      return;
    }
    const autoTitle = buildSummaryTitle(nextTranscript);
    if (!autoTitle) {
      return;
    }
    setActiveTitle(autoTitle);
  };

  const persistSession = (
    sessionId: string | null,
    title: string,
    currentTranscript: TranscriptEntry[],
    currentSuggestions: FollowupSuggestion[],
  ) => {
    // API TODO: debounce + upsert active session to backend (PUT /api/sessions/:id)
    if (!sessionId) {
      return;
    }
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title,
              transcriptHistory: currentTranscript,
              aiSuggestions: currentSuggestions,
            }
          : session,
      ),
    );
  };

  const handleSelectSession = (sessionId: string) => {
    // API TODO: GET /api/sessions/:id for latest transcript/suggestions before opening
    persistSession(activeSessionId, sessionTitle, transcript, suggestions);
    const selected = sessions.find((item) => item.id === sessionId);
    if (!selected) {
      return;
    }
    setActiveSessionId(selected.id);
    setSessionTitle(selected.title);
    setTranscript(selected.transcriptHistory);
    setSuggestions(selected.aiSuggestions);
  };

  const handleCreateSession = () => {
    // API TODO: autosave current draft before context switch
    persistSession(activeSessionId, sessionTitle, transcript, suggestions);

    const newSession: Session = {
      id: `session-${crypto.randomUUID()}`,
      title: buildNewSessionTitle(sessions),
      createdAt: new Date().toISOString(),
      transcriptHistory: [],
      aiSuggestions: [],
    };

    // API TODO: POST /api/sessions to create new session record and return id/title timestamps
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSessionTitle(newSession.title);
    setTranscript([]);
    setSuggestions([]);
    setFocusSignal((prev) => prev + 1);
  };

  const handleEditTranscriptLine = (lineId: string, text: string) => {
    const nextTranscript = transcript.map((line) =>
      line.id === lineId ? { ...line, text } : line,
    );
    setTranscript(nextTranscript);
    maybeAutoRenameByTranscript(nextTranscript);
    // API TODO: PATCH /api/sessions/:id/transcript/:lineId (manual transcript correction)
  };

  const handleAppendLine = (text: string) => {
    const nextTranscript = [
      ...transcript,
      {
        id: `line-${crypto.randomUUID()}`,
        speaker: "Founder" as const,
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];
    setTranscript(nextTranscript);
    maybeAutoRenameByTranscript(nextTranscript);
    // API TODO: POST /api/sessions/:id/transcript (append user note or transcript line)
    // API TODO: trigger AI follow-up generation (POST /api/ai/followups)
  };

  const handleAdoptSuggestion = (suggestionId: string) => {
    const target = suggestions.find((item) => item.id === suggestionId);
    if (!target) {
      return;
    }
    const nextSuggestions = suggestions.filter(
      (item) => item.id !== suggestionId,
    );
    setSuggestions(nextSuggestions);
    handleAppendLine(`追問補充：${target.question}`);
    // API TODO: PATCH /api/sessions/:id/suggestions/:suggestionId { status: "adopted" }
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    const nextSuggestions = suggestions.filter(
      (item) => item.id !== suggestionId,
    );
    setSuggestions(nextSuggestions);
    // API TODO: PATCH /api/sessions/:id/suggestions/:suggestionId { status: "dismissed" }
  };

  const handleRenameSession = (sessionId: string) => {
    const nextTitle = window.prompt("輸入新的 Session 名稱");
    if (!nextTitle?.trim()) {
      return;
    }
    setSessions((prev) =>
      prev.map((item) =>
        item.id === sessionId ? { ...item, title: nextTitle } : item,
      ),
    );
    // API TODO: PATCH /api/sessions/:id { title }
    if (activeSessionId === sessionId) {
      setSessionTitle(nextTitle);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const target = sessions.find((item) => item.id === sessionId);
    if (!target) {
      return;
    }

    const hasContent =
      target.transcriptHistory.length > 0 || target.aiSuggestions.length > 0;
    const confirmMessage = hasContent
      ? `確定要刪除「${target.title}」嗎？\n\n這個 Session 有內容，刪除後只會在目前畫面中移除（Demo 本地狀態），無法復原。`
      : `確定要刪除「${target.title}」嗎？\n\n此操作僅影響目前 Demo 畫面狀態。`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    // API TODO: in production call DELETE /api/sessions/:id (hackathon demo keeps local-only delete)
    const next = sessions.filter((item) => item.id !== sessionId);
    setSessions(next);

    if (activeSessionId !== sessionId) {
      return;
    }

    const fallback = next[0];
    setActiveSessionId(fallback?.id ?? null);
    setSessionTitle(fallback?.title ?? "Unsaved Interview Session");
    setTranscript(fallback?.transcriptHistory ?? []);
    setSuggestions(fallback?.aiSuggestions ?? []);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100">
      <div className="flex h-screen">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          prototypes={prototypeArchive}
          onCreateSession={handleCreateSession}
          onSelectSession={handleSelectSession}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          onRestorePrototype={(prototypeId) => {
            // API TODO: GET /api/prototypes/:id and hydrate current workspace with stored snapshot
            window.alert(`Prototype ${prototypeId} restored (mock).`);
          }}
        />

        <main className="flex min-w-0 flex-1 gap-4 p-4">
          <section className="flex min-w-0 flex-[1.2] flex-col gap-4">
            <SessionHeader
              title={sessionTitle}
              onChangeTitle={setActiveTitle}
              onResetSession={handleCreateSession}
            />
            <VoiceInput key={focusSignal} />
            <TranscriptStream
              transcript={transcript}
              onEditLine={handleEditTranscriptLine}
              onAppendLine={handleAppendLine}
              autoFocusSignal={focusSignal}
            />
            <div className="glass-panel rounded-2xl p-4">
              <Button
                className="w-full py-3 font-semibold"
                // API TODO: POST /api/prototypes/generate with current transcript + suggestion context
                onClick={() => {
                  console.log("[Rapid Prototyping AI Studio] open modal");
                  setPrototypeModalSeed((prev) => prev + 1);
                  setIsPrototypeOpen(true);
                }}
              >
                生成 Prototype (Generate Prototype)
              </Button>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{wordCount} words in transcript</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Voice API Connected
                </span>
              </div>
            </div>
          </section>

          <section className="min-w-0 flex-1">
            <FollowupCards
              suggestions={transcript.length > 0 ? suggestions : []}
              isAnalyzing={transcript.length > 0}
              onAdoptSuggestion={handleAdoptSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
            />
          </section>
        </main>
      </div>
      <PrototypeModal
        key={prototypeModalSeed}
        open={isPrototypeOpen}
        onClose={() => setIsPrototypeOpen(false)}
      />
    </div>
  );
}
