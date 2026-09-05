/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 13:30:52
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-05 13:33:33
 * @FilePath: /beachcomber-fe/lib/api/deepgram.ts
 */
export type DeepgramLiveResultMessage = {
  type?: string;
  is_final?: boolean;
  channel?: {
    alternatives?: Array<{
      transcript?: string;
    }>;
  };
};

type DeepgramLiveEventMessage = {
  type?: string;
};

type DeepgramLiveOptions = {
  apiKey: string;
  model?: string;
  language?: string;
  interimResults?: boolean;
  smartFormat?: boolean;
  punctuate?: boolean;
  onResult?: (payload: DeepgramLiveResultMessage) => void;
  onEvent?: (payload: DeepgramLiveEventMessage) => void;
  onError?: () => void;
  onClose?: () => void;
};

const DEFAULT_URL = "wss://api.deepgram.com/v1/listen";

export function connectDeepgramLive(options: DeepgramLiveOptions): WebSocket {
  const query = new URLSearchParams({
    model: options.model ?? "nova-3",
    language: options.language ?? "zh-TW",
    interim_results: String(options.interimResults ?? true),
    smart_format: String(options.smartFormat ?? true),
    punctuate: String(options.punctuate ?? true),
  });

  const ws = new WebSocket(`${DEFAULT_URL}?${query.toString()}`, [
    "token",
    options.apiKey,
  ]);

  ws.onmessage = (event) => {
    let payload: DeepgramLiveResultMessage | DeepgramLiveEventMessage | null =
      null;
    try {
      payload = JSON.parse(event.data) as
        | DeepgramLiveResultMessage
        | DeepgramLiveEventMessage;
    } catch {
      return;
    }

    if (!payload?.type) {
      return;
    }

    if (payload.type === "Results") {
      options.onResult?.(payload as DeepgramLiveResultMessage);
      return;
    }

    options.onEvent?.(payload as DeepgramLiveEventMessage);
  };

  ws.onerror = () => {
    options.onError?.();
  };

  ws.onclose = () => {
    options.onClose?.();
  };

  return ws;
}

export function sendDeepgramControlMessage(
  ws: WebSocket | null,
  type: "Finalize" | "CloseStream" | "KeepAlive",
) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(JSON.stringify({ type }));
}
