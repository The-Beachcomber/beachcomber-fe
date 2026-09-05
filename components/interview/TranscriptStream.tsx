/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 11:43:56
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-05 15:10:49
 * @FilePath: /beachcomber-fe/components/interview/TranscriptStream.tsx
 */
"use client";

import type { TranscriptEntry } from "@/lib/studio-types";
import { useEffect, useRef } from "react";

type TranscriptStreamProps = {
  transcript: TranscriptEntry[];
  onEditLine: (lineId: string, text: string) => void;
  onAppendLine: (text: string) => void;
  autoFocusSignal: number;
};

export function TranscriptStream({
  transcript,
  onEditLine,
  autoFocusSignal,
}: TranscriptStreamProps) {
  const quickInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    quickInputRef.current?.focus();
  }, [autoFocusSignal]);

  return (
    <div className="glass-panel flex min-h-0 flex-1 flex-col rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Transcript Stream
      </p>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
        {transcript.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-indigo-300/30 bg-indigo-500/5 p-6 text-center">
            <p className="max-w-sm text-sm leading-relaxed text-slate-300">
              點擊麥克風開始訪談，或直接輸入需求描述，AI 會即時整理成可生成
              Prototype 的上下文。
            </p>
          </div>
        ) : (
          transcript.map((line) => (
            <div
              key={line.id}
              className="rounded-xl border border-white/10 bg-slate-900/70 p-3"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>{line.speaker}</span>
                <span>{line.timestamp}</span>
              </div>
              <textarea
                value={line.text}
                onChange={(event) => onEditLine(line.id, event.target.value)}
                className="min-h-20 w-full resize-y rounded-lg border border-white/10 bg-slate-950/70 p-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
