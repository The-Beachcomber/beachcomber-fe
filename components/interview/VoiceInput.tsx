"use client";

import {
  connectDeepgramLive,
  sendDeepgramControlMessage,
  type DeepgramLiveResultMessage,
} from "@/lib/api/deepgram";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type VoiceConnectionState = "idle" | "connecting" | "listening" | "error";

type VoiceInputProps = {
  // Emits accumulated transcript text for the current recording session.
  onTranscriptFinal?: (text: string) => void;
  onConnectionChange?: (state: VoiceConnectionState) => void;
};

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

const END_PUNCTUATION_REGEX = /[。！？.!?，、；;：:]$/;
const START_PUNCTUATION_REGEX = /^[，。！？.!?、；;：:]/;

function appendChunkWithPunctuation(currentText: string, nextChunk: string) {
  const incoming = nextChunk.trim();
  if (!incoming) {
    return currentText;
  }

  if (!currentText) {
    return incoming;
  }

  const base = currentText.trim();
  if (END_PUNCTUATION_REGEX.test(base)) {
    return START_PUNCTUATION_REGEX.test(incoming)
      ? `${base}${incoming.slice(1)}`
      : `${base}${incoming}`;
  }

  return START_PUNCTUATION_REGEX.test(incoming)
    ? `${base}${incoming}`
    : `${base}，${incoming}`;
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VoiceInput({
  onTranscriptFinal,
  onConnectionChange,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [statusText, setStatusText] = useState("Ready to listen");

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const keepAliveTimerRef = useRef<number | null>(null);
  const mockTimerRef = useRef<number | null>(null);
  const mockCursorRef = useRef(0);
  const fullTranscriptRef = useRef("");
  const lastFinalChunkRef = useRef("");

  const pushConnectionState = (state: VoiceConnectionState) => {
    onConnectionChange?.(state);
  };

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendDeepgramControlMessage(wsRef.current, "CloseStream");
        wsRef.current.close();
      }
      if (keepAliveTimerRef.current) {
        window.clearInterval(keepAliveTimerRef.current);
      }
      if (mockTimerRef.current) {
        window.clearInterval(mockTimerRef.current);
      }
    };
  }, []);

  const stopStreaming = () => {
    const ws = wsRef.current;
    const recorder = mediaRecorderRef.current;
    const stream = mediaStreamRef.current;

    if (keepAliveTimerRef.current) {
      window.clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    if (mockTimerRef.current) {
      window.clearInterval(mockTimerRef.current);
      mockTimerRef.current = null;
    }

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    stream?.getTracks().forEach((track) => track.stop());

    if (ws && ws.readyState === WebSocket.OPEN) {
      sendDeepgramControlMessage(ws, "Finalize");
      sendDeepgramControlMessage(ws, "CloseStream");
      ws.close();
    }

    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    wsRef.current = null;
    fullTranscriptRef.current = "";
    lastFinalChunkRef.current = "";
    setIsRecording(false);
    setSeconds(0);
    setStatusText("Ready to listen");
    pushConnectionState("idle");
  };

  const startStreaming = async () => {
    fullTranscriptRef.current = "";
    lastFinalChunkRef.current = "";

    if (!DEEPGRAM_API_KEY) {
      setIsRecording(true);
      setSeconds(0);
      setStatusText("Demo Listening...");
      pushConnectionState("listening");
      return;
    }

    setStatusText("Connecting to Deepgram...");
    pushConnectionState("connecting");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStreamRef.current = mediaStream;

      const ws = connectDeepgramLive({
        apiKey: DEEPGRAM_API_KEY,
        model: "nova-3",
        language: "zh-TW",
        interimResults: true,
        smartFormat: true,
        punctuate: true,
        onResult: (payload: DeepgramLiveResultMessage) => {
          const transcript =
            payload.channel?.alternatives?.[0]?.transcript?.trim();
          if (!transcript) {
            return;
          }

          if (payload.is_final) {
            if (transcript === lastFinalChunkRef.current) {
              return;
            }
            lastFinalChunkRef.current = transcript;
            fullTranscriptRef.current = appendChunkWithPunctuation(
              fullTranscriptRef.current,
              transcript,
            );
            onTranscriptFinal?.(fullTranscriptRef.current);
          }
        },
        onError: () => {
          setStatusText("Voice stream error");
          pushConnectionState("error");
        },
        onClose: () => {
          mediaRecorderRef.current = null;
          mediaStreamRef.current = null;
          wsRef.current = null;
          if (keepAliveTimerRef.current) {
            window.clearInterval(keepAliveTimerRef.current);
            keepAliveTimerRef.current = null;
          }
          setIsRecording(false);
          setSeconds(0);
          setStatusText("Ready to listen");
          pushConnectionState("idle");
          fullTranscriptRef.current = "";
          lastFinalChunkRef.current = "";
        },
      });
      wsRef.current = ws;

      ws.onopen = () => {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
        const mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (!event.data || event.data.size === 0) {
            return;
          }
          if (ws.readyState !== WebSocket.OPEN) {
            return;
          }
          const buffer = await event.data.arrayBuffer();
          ws.send(buffer);
        };

        mediaRecorder.start(250);

        keepAliveTimerRef.current = window.setInterval(() => {
          sendDeepgramControlMessage(ws, "KeepAlive");
        }, 8000);

        setIsRecording(true);
        setStatusText("Listening...");
        pushConnectionState("listening");
      };

      // events are handled by lib/api/deepgram callbacks
    } catch {
      setStatusText("Microphone permission denied");
      pushConnectionState("error");
    }
  };

  const bars = useMemo(() => new Array(12).fill(0), []);

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Voice Input Controller
          </p>
          <p className="text-sm text-slate-300">{statusText}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-slate-100">
            {formatSeconds(seconds)}
          </span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              isRecording ? stopStreaming() : void startStreaming()
            }
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
