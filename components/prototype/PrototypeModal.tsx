"use client";

import { SpecViewer } from "@/components/spec/SpecViewer";
import { Button } from "@/components/ui/button";
import { mockSpecs } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type PrototypeModalProps = {
  open: boolean;
  onClose: () => void;
};

type ViewportMode = "desktop" | "mobile";
type ModalStage = "preview" | "spec";

function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.25) 0.5px, transparent 0.5px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0.5px, transparent 0.5px)",
        backgroundSize: "3px 3px, 4px 4px",
      }}
    />
  );
}

function DesktopMock() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-6">
      <NoiseOverlay />
      <div className="relative grid h-full grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
          <p className="text-xs tracking-[0.2em] text-slate-400">HERO</p>
          <div className="mt-3 h-20 rounded-xl bg-linear-to-r from-indigo-500/40 via-violet-500/40 to-fuchsia-500/30 shadow-[0_0_22px_rgba(99,102,241,0.35)]" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-5/6 rounded bg-white/15" />
            <div className="h-3 w-2/3 rounded bg-white/10" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/75 p-4">
            <p className="text-xs tracking-[0.2em] text-slate-400">METRICS</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["Latency", "Score", "Adoption", "Risk"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/10 bg-slate-950/60 p-2"
                >
                  <p className="text-[11px] text-slate-500">{item}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    87
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/75 p-4">
            <p className="text-xs tracking-[0.2em] text-slate-400">ACTIVITY</p>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded bg-white/15" />
              <div className="h-3 w-4/5 rounded bg-white/10" />
              <div className="h-3 w-2/3 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMock() {
  return (
    <div className="mx-auto h-full w-[330px] rounded-[2rem] border border-white/15 bg-slate-950 p-3 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
      <div className="h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-4">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />
        <div className="rounded-xl border border-white/10 bg-linear-to-r from-indigo-500/35 to-violet-500/35 p-4">
          <p className="text-sm font-semibold">Prototype Summary</p>
          <p className="mt-1 text-xs text-slate-200">
            Interview-driven feature plan
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 bg-slate-950/70 p-3"
            >
              <div className="h-3 w-2/3 rounded bg-white/15" />
              <div className="mt-2 h-2.5 w-full rounded bg-white/10" />
              <div className="mt-1.5 h-2.5 w-5/6 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PrototypeModal({ open, onClose }: PrototypeModalProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [stage, setStage] = useState<ModalStage>("preview");
  const preview = useMemo(
    () => (viewport === "desktop" ? <DesktopMock /> : <MobileMock />),
    [viewport],
  );

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
              {stage === "preview"
                ? "https://rapid-prototype.local/preview"
                : "https://rapid-prototype.local/spec-view"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stage === "preview" ? (
              <>
                <Button
                  variant={viewport === "desktop" ? "default" : "outline"}
                  onClick={() => setViewport("desktop")}
                  className="py-1.5 text-xs"
                >
                  🖥️ Desktop
                </Button>
                <Button
                  variant={viewport === "mobile" ? "default" : "outline"}
                  onClick={() => setViewport("mobile")}
                  className="py-1.5 text-xs"
                >
                  📱 Mobile
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setStage("preview")}
                className="py-1.5 text-xs"
              >
                ← 回到 Prototype 預覽
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="py-1.5 text-xs"
            >
              關閉
            </Button>
          </div>
        </header>

        <div className="flex-1 bg-slate-950/80 p-5">
          {stage === "preview" ? preview : <SpecViewer specs={mockSpecs} />}
        </div>

        <footer className="flex items-center justify-between border-t border-white/10 px-5 py-3">
          {stage === "preview" ? (
            <>
              <p className="text-xs text-slate-400">Preview mode: {viewport}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline">💬 提出修改意見 (Re-generate)</Button>
                <Button
                  // API TODO: POST /api/specs/generate after prototype is confirmed
                  onClick={() => setStage("spec")}
                >
                  ✅ 確認 Prototype 無誤，產出 Spec
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Spec View 已就緒（PM/UIUX/Frontend/Backend/SA）
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setStage("preview")}>
                  回到預覽微調
                </Button>
                <Button onClick={onClose}>完成</Button>
              </div>
            </>
          )}
        </footer>
      </motion.div>
    </div>
  );
}
