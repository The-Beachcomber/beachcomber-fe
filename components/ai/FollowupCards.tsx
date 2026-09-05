/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 11:44:01
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-06 02:16:48
 * @FilePath: /beachcomber-fe/components/ai/FollowupCards.tsx
 */
"use client";

import type { MeetingQuestionItem } from "@/lib/api/meetings";
import type { FollowupSuggestion } from "@/lib/studio-types";
import { motion } from "framer-motion";

type FollowupCardsProps = {
  suggestions: FollowupSuggestion[];
  questionItems?: MeetingQuestionItem[];
  isAnalyzing: boolean;
  onAdoptSuggestion: (id: string) => void;
  onDismissSuggestion: (id: string) => void;
};

export function FollowupCards({
  suggestions,
  questionItems = [],
  isAnalyzing,
}: FollowupCardsProps) {
  const validQuestionItems = questionItems.filter((item) =>
    Boolean(item.question?.trim()),
  );

  if (suggestions.length === 0 && validQuestionItems.length === 0) {
    return (
      <div className="glass-panel flex h-full items-center justify-center rounded-2xl p-6 text-center">
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            AI Suggestion Engine 初始化中
          </p>
          <p className="text-xs text-slate-500">
            左側開始輸入訪談內容後，這裡會即時提供待澄清的架構與功能問題。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel h-full rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          AI Follow-up Suggestions
        </p>
        {isAnalyzing && (
          <motion.span
            className="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.15, 0.95] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </div>

      <div className="space-y-3">
        {validQuestionItems.length > 0 && (
          <div className="space-y-2 rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-200/90">
              Meeting Questions
            </p>
            <div className="space-y-2">
              {validQuestionItems.map((item, index) => (
                <div
                  key={item.entry_id ?? `meeting-question-${index + 1}`}
                  className="rounded-lg border border-white/10 bg-slate-900/70 p-2.5"
                >
                  <p className="text-xs leading-relaxed text-slate-100">
                    {item.question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
