"use client";

import { Button } from "@/components/ui/button";
import { exportSpecsDocument } from "@/lib/api";
import type { SpecGenerationRole } from "@/lib/api/spec";
import { useMemo, useState } from "react";

const ROLE_TABS: Array<{ key: SpecGenerationRole; label: string }> = [
  { key: "pm", label: "📋 PM" },
  { key: "ui", label: "🎨 UI" },
  { key: "eng", label: "💻 ENG" },
  { key: "qa", label: "🧪 QA" },
];

type SpecViewerProps = {
  specs: Partial<Record<SpecGenerationRole, string>>;
  initialRole?: SpecGenerationRole;
};

export function SpecViewer({ specs, initialRole = "pm" }: SpecViewerProps) {
  const [activeRole, setActiveRole] = useState<SpecGenerationRole>(initialRole);
  const activeSpecUrl = useMemo(
    () => specs[activeRole] ?? "",
    [activeRole, specs],
  );

  const handleCopySpecUrl = async () => {
    if (!navigator.clipboard?.writeText) {
      window.alert("目前環境不支援 Clipboard API，請手動複製內容。");
      return;
    }

    await navigator.clipboard.writeText(activeSpecUrl);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/80">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {ROLE_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeRole === tab.key ? "default" : "outline"}
              onClick={() => setActiveRole(tab.key)}
              className="py-1.5 text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void handleCopySpecUrl()}
            disabled={!activeSpecUrl}
            className="py-1.5 text-xs"
          >
            📋 複製 Spec URL
          </Button>
          <Button
            variant="outline"
            disabled={!activeSpecUrl}
            className="py-1.5 text-xs"
            onClick={() => {
              void exportSpecsDocument({ format: "pdf", role: activeRole });
              window.alert("已觸發匯出 API（demo mock）");
            }}
          >
            ⬇️ 匯出 PDF/Doc
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-4">
        {activeSpecUrl ? (
          <div className="flex h-full min-h-0 flex-col gap-2">
            <a
              href={activeSpecUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-300 underline underline-offset-2"
            >
              開新分頁開啟 Spec
            </a>
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-white">
              <iframe
                title={`${activeRole}-spec-preview`}
                src={activeSpecUrl}
                className="h-full w-full"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center rounded-xl border border-white/10 bg-slate-900/60 p-6 text-center">
            <p className="text-sm text-slate-400">
              目前沒有 {activeRole.toUpperCase()} 的 Spec。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
