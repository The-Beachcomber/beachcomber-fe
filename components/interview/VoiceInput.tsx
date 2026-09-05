"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRecording]);

  const bars = useMemo(() => new Array(12).fill(0), []);

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Voice Input Controller
          </p>
          <p className="text-sm text-slate-300">
            {isRecording ? "Listening..." : "Ready to listen"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-slate-100">
            {formatSeconds(seconds)}
          </span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // API TODO: start/stop streaming speech recognition
              // - start: request mic token/session (POST /api/voice/session)
              // - stream: websocket/sse audio chunks to STT
              // - stop: finalize and return transcript segments
              setIsRecording((prev) => !prev);
            }}
            className={`flex h-12 w-12 items-center justify-center rounded-full border text-xl ${
              isRecording
                ? "border-rose-400 bg-rose-500/20 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.45)]"
                : "border-indigo-400/40 bg-indigo-500/20 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            }`}
          >
            🎙️
          </motion.button>
        </div>
      </div>

      <div className="mt-4 flex h-12 items-end gap-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 pb-2">
        {bars.map((_, index) => (
          <motion.div
            key={index}
            className="w-1 rounded-full bg-linear-to-b from-indigo-300 to-violet-500"
            animate={{
              height: isRecording ? [6, 24 + (index % 4) * 6, 8] : 6,
              opacity: isRecording ? [0.4, 1, 0.5] : 0.3,
            }}
            transition={{
              repeat: isRecording ? Number.POSITIVE_INFINITY : 0,
              duration: 1 + (index % 3) * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
