"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemo } from "react";

type PrototypeModalProps = {
  open: boolean;
  prototypeUrl: string | null;
  isLoading: boolean;
  onClose: () => void;
};

export function PrototypeModal({
  open,
  prototypeUrl,
  isLoading,
  onClose,
}: PrototypeModalProps) {
  const iframeSrc = useMemo(() => prototypeUrl?.trim() ?? "", [prototypeUrl]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Prototype Preview
          </div>
          <Button variant="ghost" onClick={onClose} className="py-1.5 text-xs">
            關閉
          </Button>
        </header>

        <div className="flex-1 bg-slate-950/80 p-5">
          {iframeSrc ? (
            <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white">
              <iframe
                title="Prototype HTML Preview"
                src={iframeSrc}
                className="h-full w-full"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center">
              <p className="text-sm text-slate-300">
                {isLoading
                  ? "Prototype 生成中，請稍候..."
                  : "尚未取得 Prototype 頁面，請先重新生成。"}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
