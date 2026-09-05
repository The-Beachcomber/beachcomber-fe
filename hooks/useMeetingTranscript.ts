/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 15:30:56
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-05 15:32:22
 * @FilePath: /beachcomber-fe/hooks/useMeetingTranscript.ts
 */
"use client";

import {
  postMeetingTranscript,
  type MeetingTranscriptPayload,
  type MeetingTranscriptResponse,
} from "@/lib/api/meetings";
import { useCallback, useState } from "react";

const STASH_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INITIAL_MEETING_ID = "pending_meeting_id";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function generateStash(length = 6) {
  let stash = "";
  for (let i = 0; i < length; i += 1) {
    stash += STASH_CHARS[Math.floor(Math.random() * STASH_CHARS.length)];
  }
  return stash;
}

export function generateMeetingId(date = new Date()) {
  const timestamp = `${date.getFullYear()}_${pad(date.getMonth() + 1)}_${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
  return `${timestamp}_${generateStash()}`;
}

export function useMeetingTranscript() {
  const [meetingId, setMeetingId] = useState(INITIAL_MEETING_ID);
  const [isPostingTranscript, setIsPostingTranscript] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const resetMeetingId = useCallback(() => {
    const nextMeetingId = generateMeetingId();
    setMeetingId(nextMeetingId);
    return nextMeetingId;
  }, []);

  const postTranscript = useCallback(
    async (payload: MeetingTranscriptPayload) => {
      const effectiveMeetingId =
        meetingId === INITIAL_MEETING_ID ? generateMeetingId() : meetingId;
      if (meetingId === INITIAL_MEETING_ID) {
        setMeetingId(effectiveMeetingId);
      }
      setIsPostingTranscript(true);
      setPostError(null);
      try {
        const result = await postMeetingTranscript(effectiveMeetingId, payload);
        return { meetingId: effectiveMeetingId, result } as {
          meetingId: string;
          result: MeetingTranscriptResponse | null;
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setPostError(message);
        throw error;
      } finally {
        setIsPostingTranscript(false);
      }
    },
    [meetingId],
  );

  return {
    meetingId,
    isPostingTranscript,
    postError,
    postTranscript,
    resetMeetingId,
  };
}
