"use client";

import { FollowupCards } from "@/components/ai/FollowupCards";
import { SessionHeader } from "@/components/interview/SessionHeader";
import { TranscriptStream } from "@/components/interview/TranscriptStream";
import { VoiceInput } from "@/components/interview/VoiceInput";
import { Sidebar } from "@/components/layout/Sidebar";
import { PrototypeModal } from "@/components/prototype/PrototypeModal";
import { Button } from "@/components/ui/button";
import { useMeetingTranscript } from "@/hooks/useMeetingTranscript";
import {
  appendTranscriptLine,
  createSession as createSessionApi,
  deleteSessionById,
  fetchSessionById,
  generatePrototype,
  renameSession as renameSessionApi,
  restorePrototypeById,
  updateSession,
  updateSuggestionStatus,
  updateTranscriptLine,
} from "@/lib/api";
import type { MeetingQuestionItem } from "@/lib/api/meetings";
import type {
  FollowupSuggestion,
  Session,
  TranscriptEntry,
} from "@/lib/studio-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
const VOICE_TRANSCRIPT_LINE_ID = "voice-live-transcript";
const MEETING_ID_PATTERN = /^\d{4}_\d{2}_\d{2}_\d{4}_[A-Z2-9]{6}$/;

function buildNewSessionTitle(list: Session[]) {
  return `New Session #${String(list.length + 1).padStart(2, "0")}`;
}

function isAutoManagedTitle(title: string) {
  return AUTO_TITLE_PATTERNS.some((pattern) => pattern.test(title));
}

function createLocalId(prefix: string) {
  const randomUUID = (
    globalThis.crypto as (Crypto & { randomUUID?: () => string }) | undefined
  )?.randomUUID;
  const suffix =
    typeof randomUUID === "function"
      ? randomUUID.call(globalThis.crypto)
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${suffix}`;
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

function mapMeetingQuestionsToSuggestions(
  questions: MeetingQuestionItem[] | undefined,
): FollowupSuggestion[] {
  if (!questions?.length) {
    return [];
  }

  return questions.reduce<FollowupSuggestion[]>((acc, item, index) => {
    const question = item.question?.trim();
    if (!question) {
      return acc;
    }

    acc.push({
      id: item.entry_id ?? `question-${index + 1}`,
      question,
      status: "pending",
    });
    return acc;
  }, []);
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState("Unsaved Interview Session");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [suggestions, setSuggestions] = useState<FollowupSuggestion[]>([]);
  const [questionItems, setQuestionItems] = useState<MeetingQuestionItem[]>([]);
  const [focusSignal, setFocusSignal] = useState(0);
  const [isPrototypeOpen, setIsPrototypeOpen] = useState(false);
  const [prototypeModalSeed, setPrototypeModalSeed] = useState(0);
  const [prototypeUrl, setPrototypeUrl] = useState<string | null>(null);
  const [prototypeTranscriptText, setPrototypeTranscriptText] = useState<
    string | null
  >(null);
  const [isPrototypeLoading, setIsPrototypeLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<
    "idle" | "connecting" | "listening" | "error"
  >("idle");
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const {
    meetingId,
    isPostingTranscript,
    postError,
    postTranscript,
    resetMeetingId,
  } = useMeetingTranscript();

  const wordCount = useMemo(
    () =>
      transcript
        .map((line) => line.text.trim())
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length,
    [transcript],
  );

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

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
    void updateSession({
      sessionId,
      title,
      transcriptHistory: currentTranscript,
      aiSuggestions: currentSuggestions,
    });
  };

  const handleSelectSession = (sessionId: string) => {
    persistSession(activeSessionId, sessionTitle, transcript, suggestions);
    void fetchSessionById(sessionId);
    const selected = sessions.find((item) => item.id === sessionId);
    if (!selected) {
      return;
    }
    setActiveSessionId(selected.id);
    setSessionTitle(selected.title);
    setTranscript(selected.transcriptHistory);
    setSuggestions(selected.aiSuggestions);
    setQuestionItems([]);
  };

  const handleCreateSession = () => {
    persistSession(activeSessionId, sessionTitle, transcript, suggestions);

    const newSession: Session = {
      id: createLocalId("session"),
      title: buildNewSessionTitle(sessions),
      createdAt: new Date().toISOString(),
      transcriptHistory: [],
      aiSuggestions: [],
    };

    void createSessionApi({
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSessionTitle(newSession.title);
    setTranscript([]);
    setSuggestions([]);
    setQuestionItems([]);
    setFocusSignal((prev) => prev + 1);
    resetMeetingId();
  };

  const handleEditTranscriptLine = (lineId: string, text: string) => {
    const nextTranscript = transcript.map((line) =>
      line.id === lineId ? { ...line, text } : line,
    );
    setTranscript(nextTranscript);
    maybeAutoRenameByTranscript(nextTranscript);
    if (activeSessionId) {
      void updateTranscriptLine({ sessionId: activeSessionId, lineId, text });
    }
  };

  const handleAppendLine = (text: string) => {
    const newLine: TranscriptEntry = {
      id: createLocalId("line"),
      speaker: "Founder",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const nextTranscript = [...transcript, newLine];
    setTranscript(nextTranscript);
    maybeAutoRenameByTranscript(nextTranscript);
    if (activeSessionId) {
      void appendTranscriptLine({ sessionId: activeSessionId, line: newLine });
    }
  };

  const handleVoiceTranscriptFull = (fullText: string) => {
    const normalized = fullText.trim();
    if (!normalized) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let nextTranscriptSnapshot: TranscriptEntry[] = transcript;
    let hasExistingVoiceLine = false;

    setTranscript((prev: TranscriptEntry[]) => {
      hasExistingVoiceLine = prev.some(
        (line) => line.id === VOICE_TRANSCRIPT_LINE_ID,
      );

      const next: TranscriptEntry[] = hasExistingVoiceLine
        ? prev.map((line) =>
            line.id === VOICE_TRANSCRIPT_LINE_ID
              ? { ...line, text: normalized, timestamp }
              : line,
          )
        : [
            ...prev,
            {
              id: VOICE_TRANSCRIPT_LINE_ID,
              speaker: "Founder",
              text: normalized,
              timestamp,
            },
          ];

      nextTranscriptSnapshot = next;
      return next;
    });

    maybeAutoRenameByTranscript(nextTranscriptSnapshot);

    if (activeSessionId) {
      if (hasExistingVoiceLine) {
        void updateTranscriptLine({
          sessionId: activeSessionId,
          lineId: VOICE_TRANSCRIPT_LINE_ID,
          text: normalized,
        });
      } else {
        void appendTranscriptLine({
          sessionId: activeSessionId,
          line: {
            id: VOICE_TRANSCRIPT_LINE_ID,
            speaker: "Founder",
            text: normalized,
            timestamp,
          },
        });
      }
    }
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
    if (activeSessionId) {
      void updateSuggestionStatus({
        sessionId: activeSessionId,
        suggestionId,
        status: "adopted",
      });
    }
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    const nextSuggestions = suggestions.filter(
      (item) => item.id !== suggestionId,
    );
    setSuggestions(nextSuggestions);
    if (activeSessionId) {
      void updateSuggestionStatus({
        sessionId: activeSessionId,
        suggestionId,
        status: "dismissed",
      });
    }
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
    void renameSessionApi({ sessionId, title: nextTitle });
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

    void deleteSessionById(sessionId);
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

  const syncQuestionsFromTranscript = useCallback(async () => {
    const transcriptText = transcriptRef.current
      .map((line) => line.text.trim())
      .filter(Boolean)
      .join("\n");

    if (!transcriptText) {
      return;
    }

    const transcriptPost = await postTranscript({ text: transcriptText });
    const nextQuestions = transcriptPost.result?.questions ?? [];
    setQuestionItems(nextQuestions);
    setSuggestions(mapMeetingQuestionsToSuggestions(nextQuestions));
  }, [postTranscript]);

  useEffect(() => {
    if (voiceState !== "listening") {
      return;
    }

    void syncQuestionsFromTranscript().catch((error) => {
      console.error("Initial transcript sync failed", error);
    });

    const timer = window.setInterval(() => {
      void syncQuestionsFromTranscript().catch((error) => {
        console.error("Auto transcript sync failed", error);
      });
    }, 30000);

    return () => window.clearInterval(timer);
  }, [voiceState, syncQuestionsFromTranscript]);

  const handleGeneratePrototype = async () => {
    const effectiveMeetingId = MEETING_ID_PATTERN.test(meetingId)
      ? meetingId
      : resetMeetingId();
    const transcriptPayload = {
      text: transcript
        .map((line) => line.text.trim())
        .filter(Boolean)
        .join("\n"),
    };

    setPrototypeUrl(null);
    setPrototypeTranscriptText(transcriptPayload.text || null);
    setIsPrototypeLoading(true);
    setPrototypeModalSeed((prev) => prev + 1);
    setIsPrototypeOpen(true);

    try {
      const result = await generatePrototype(
        effectiveMeetingId,
        transcriptPayload,
      );
      setPrototypeUrl(result.prototypes);
      console.log("[Rapid Prototyping AI Studio] prototype loaded", {
        meetingId: effectiveMeetingId,
      });
    } catch (error) {
      console.error("[Rapid Prototyping AI Studio] prototype failed", error);
    } finally {
      setIsPrototypeLoading(false);
    }
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
            void restorePrototypeById(prototypeId);
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
            <VoiceInput
              key={focusSignal}
              onTranscriptFinal={handleVoiceTranscriptFull}
              onConnectionChange={setVoiceState}
            />
            <TranscriptStream
              transcript={transcript}
              onEditLine={handleEditTranscriptLine}
              onAppendLine={handleAppendLine}
              autoFocusSignal={focusSignal}
            />
            <div className="glass-panel rounded-2xl p-4">
              <Button
                className="w-full py-3 font-semibold"
                disabled={isPostingTranscript || isPrototypeLoading}
                onClick={() => void handleGeneratePrototype()}
              >
                {isPostingTranscript
                  ? "同步逐字稿中..."
                  : isPrototypeLoading
                    ? "Prototype 生成中..."
                    : "生成 Prototype (Generate Prototype)"}
              </Button>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{wordCount} words in transcript</span>
                <span className="inline-flex items-center gap-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      voiceState === "listening"
                        ? "bg-emerald-400"
                        : voiceState === "connecting"
                          ? "bg-amber-300"
                          : voiceState === "error"
                            ? "bg-rose-400"
                            : "bg-slate-500"
                    }`}
                  />
                  {voiceState === "listening"
                    ? "Deepgram Live"
                    : voiceState === "connecting"
                      ? "Connecting..."
                      : voiceState === "error"
                        ? "Voice Error"
                        : "Voice Idle"}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                meeting_id: {meetingId}
              </div>
              {postError && (
                <div className="mt-1 text-[11px] text-rose-300">
                  Transcript POST 失敗：{postError}
                </div>
              )}
            </div>
          </section>

          <section className="min-w-0 flex-1">
            <FollowupCards
              suggestions={suggestions}
              questionItems={questionItems}
              isAnalyzing={isPostingTranscript || transcript.length > 0}
              onAdoptSuggestion={handleAdoptSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
            />
          </section>
        </main>
      </div>
      <PrototypeModal
        key={prototypeModalSeed}
        open={isPrototypeOpen}
        meetingId={MEETING_ID_PATTERN.test(meetingId) ? meetingId : null}
        prototypeUrl={prototypeUrl}
        transcriptText={prototypeTranscriptText}
        isLoading={isPrototypeLoading}
        onClose={() => setIsPrototypeOpen(false)}
      />
    </div>
  );
}
