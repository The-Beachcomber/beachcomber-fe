/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 11:43:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-05 12:36:22
 * @FilePath: /beachcomber-fe/components/layout/Sidebar.tsx
 */
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/studio-types";

type PrototypeItem = {
  id: string;
  title: string;
  createdAt: string;
};

type SidebarProps = {
  sessions: Session[];
  activeSessionId: string | null;
  prototypes: PrototypeItem[];
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRestorePrototype: (prototypeId: string) => void;
};

type SessionGroup = {
  label: "Today" | "Yesterday" | "Previous 7 Days";
  sessions: Session[];
};

const APP_TIME_ZONE = "Asia/Taipei";
const SESSION_TIME_FORMATTER = new Intl.DateTimeFormat("zh-TW", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: APP_TIME_ZONE,
});

function groupSessions(items: Session[]): SessionGroup[] {
  const now = new Date();
  const startOfTodayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const oneDay = 1000 * 60 * 60 * 24;

  const groups: SessionGroup[] = [
    { label: "Today", sessions: [] },
    { label: "Yesterday", sessions: [] },
    { label: "Previous 7 Days", sessions: [] },
  ];

  items.forEach((session) => {
    const createdAt = new Date(session.createdAt);
    const createdDayUtc = Date.UTC(
      createdAt.getUTCFullYear(),
      createdAt.getUTCMonth(),
      createdAt.getUTCDate(),
    );
    const diffDays = Math.floor((startOfTodayUtc - createdDayUtc) / oneDay);

    if (diffDays <= 0) {
      groups[0].sessions.push(session);
      return;
    }
    if (diffDays === 1) {
      groups[1].sessions.push(session);
      return;
    }
    if (diffDays <= 7) {
      groups[2].sessions.push(session);
    }
  });

  return groups;
}

export function Sidebar({
  sessions,
  activeSessionId,
  prototypes,
  onCreateSession,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onRestorePrototype,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sessionGroups = useMemo(() => groupSessions(sessions), [sessions]);

  return (
    <aside
      className={`h-full border-r border-white/10 bg-slate-950/80 backdrop-blur-md transition-all duration-300 ${collapsed ? "w-20" : "w-65"}`}
    >
      <div className="flex h-full flex-col gap-4 p-3">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 shadow-[0_0_20px_rgba(99,102,241,0.35)]" />
              {!collapsed && (
                <div>
                  <p className="text-sm font-semibold text-white">
                    Rapid Prototyping
                  </p>
                  <p className="text-xs text-slate-400">AI Studio</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/5"
            >
              {collapsed ? ">" : "<"}
            </button>
          </div>

          <Button
            onClick={onCreateSession}
            className="w-full py-2 font-semibold"
            title="Create new session"
          >
            {collapsed ? "+ New" : "+ 建立新對話 (+ New Session)"}
          </Button>
        </header>

        {!collapsed && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <details
              open
              className="rounded-xl border border-white/10 bg-slate-900/55 p-2"
            >
              <summary className="cursor-pointer list-none text-xs font-semibold tracking-wide text-slate-200">
                📂 對話歷史紀錄
              </summary>
              <div className="mt-2 max-h-80 space-y-3 overflow-y-auto pr-1">
                {sessionGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-1 text-[11px] uppercase tracking-wide text-slate-500">
                      {group.label}
                    </p>
                    <div className="mt-1 space-y-1">
                      {group.sessions.length === 0 ? (
                        <p className="px-2 py-1 text-xs text-slate-500">
                          No sessions
                        </p>
                      ) : (
                        group.sessions.map((session) => {
                          const active = activeSessionId === session.id;
                          return (
                            <div
                              key={session.id}
                              className={`group rounded-lg border px-2 py-2 transition ${
                                active
                                  ? "border-indigo-500 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                                  : "border-transparent bg-slate-900/70 hover:border-white/10"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => onSelectSession(session.id)}
                                className="w-full text-left text-sm text-slate-100"
                              >
                                {session.title}
                              </button>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-[11px] text-slate-500">
                                  {SESSION_TIME_FORMATTER.format(
                                    new Date(session.createdAt),
                                  )}
                                </span>
                                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() => onRenameSession(session.id)}
                                    className="rounded px-1.5 py-0.5 text-[11px] text-slate-300 hover:bg-white/10"
                                  >
                                    Rename
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteSession(session.id)}
                                    className="rounded px-1.5 py-0.5 text-[11px] text-rose-300 hover:bg-rose-500/20"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>

            <details
              open
              className="rounded-xl border border-white/10 bg-slate-900/55 p-2"
            >
              <summary className="cursor-pointer list-none text-xs font-semibold tracking-wide text-slate-200">
                🎨 Prototype 歷史紀錄
              </summary>
              <div className="mt-2 space-y-1">
                {prototypes.map((prototype) => (
                  <button
                    key={prototype.id}
                    type="button"
                    onClick={() => onRestorePrototype(prototype.id)}
                    className="w-full rounded-lg border border-transparent bg-slate-900/60 px-2 py-2 text-left hover:border-white/10"
                  >
                    <p className="text-sm text-slate-100">{prototype.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {prototype.createdAt}
                    </p>
                  </button>
                ))}
              </div>
            </details>
          </div>
        )}

        <footer className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
          <p className="text-sm font-medium text-slate-100">Fang YuKung</p>
          <p className="text-xs text-slate-400">
            Pro Plan ・ Voice API Connected
          </p>
        </footer>
      </div>
    </aside>
  );
}
