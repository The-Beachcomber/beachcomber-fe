"use client";

import { Button } from "@/components/ui/button";
import { exportSpecsDocument } from "@/lib/api";
import type { SpecMap, SpecRole } from "@/lib/studio-types";
import { useMemo, useState } from "react";

const ROLE_TABS: Array<{ key: SpecRole; label: string }> = [
  { key: "pm", label: "📋 PM" },
  { key: "uiux", label: "🎨 UI/UX" },
  { key: "frontend", label: "💻 Frontend" },
  { key: "backend", label: "⚙️ Backend" },
  { key: "sa", label: "🛡️ SA" },
];

type SpecViewerProps = {
  specs: SpecMap;
};

export function SpecViewer({ specs }: SpecViewerProps) {
  const [activeRole, setActiveRole] = useState<SpecRole>("pm");
  const activeMarkdown = useMemo(() => specs[activeRole], [activeRole, specs]);

  const handleCopyMarkdown = async () => {
    if (!navigator.clipboard?.writeText) {
      window.alert("目前環境不支援 Clipboard API，請手動複製內容。");
      return;
    }

    await navigator.clipboard.writeText(activeMarkdown);
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
            onClick={handleCopyMarkdown}
            className="py-1.5 text-xs"
          >
            📋 複製 Markdown
          </Button>
          <Button
            variant="outline"
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

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-200">
          {activeMarkdown}
        </pre>
      </div>
    </div>
  );
}
