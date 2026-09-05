/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 11:44:01
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-05 12:36:14
 * @FilePath: /beachcomber-fe/components/ai/FollowupCards.tsx
 */
"use client";

import type { FollowupSuggestion } from "@/lib/studio-types";
import { motion } from "framer-motion";

type FollowupCardsProps = {
  suggestions: FollowupSuggestion[];
  isAnalyzing: boolean;
  onAdoptSuggestion: (id: string) => void;
  onDismissSuggestion: (id: string) => void;
};

export function FollowupCards({
  suggestions,
  isAnalyzing,
  onAdoptSuggestion,
  onDismissSuggestion,
}: FollowupCardsProps) {
  if (suggestions.length === 0) {
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
        {suggestions.map((card) => (
          <motion.div
            key={card.id}
            layout
            className="rounded-xl border border-white/10 bg-slate-900/70 p-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm leading-relaxed text-slate-100">
              {card.question}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onAdoptSuggestion(card.id)}
                className="rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-200 hover:bg-indigo-500/20"
              >
                ➕ 採納並補充到對話
              </button>
              <button
                type="button"
                onClick={() => onDismissSuggestion(card.id)}
                className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/5"
              >
                ❌ 忽略
              </button>
              <input
                placeholder="✍️ 快捷回覆..."
                className="min-w-37.5 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-400"
                // API TODO: submit quick answer to AI context (POST /api/sessions/:id/suggestions/:id/reply)
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
