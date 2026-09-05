"use client";

type SessionHeaderProps = {
  title: string;
  onChangeTitle: (title: string) => void;
  onResetSession: () => void;
};

export function SessionHeader({
  title,
  onChangeTitle,
  onResetSession,
}: SessionHeaderProps) {
  return (
    <div className="glass-panel flex items-center justify-between rounded-2xl p-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Current Session
        </p>
        <input
          value={title}
          onChange={(event) => onChangeTitle(event.target.value)}
          onBlur={() =>
            onChangeTitle(title.trim() || "Unsaved Interview Session")
          }
          className="w-full max-w-90 border-none bg-transparent text-lg font-semibold text-white outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            onChangeTitle(title.trim() || "Unsaved Interview Session")
          }
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5"
        >
          儲存名稱
        </button>
        <button
          type="button"
          onClick={onResetSession}
          className="rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/10"
        >
          清空/新建對話
        </button>
      </div>
    </div>
  );
}
