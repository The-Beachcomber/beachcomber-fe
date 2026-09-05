export type MeetingTranscriptPayload = {
  text: string;
};

export type MeetingQuestionItem = {
  entry_id?: string;
  question?: string;
};

export type MeetingTranscriptResponse = {
  round?: number;
  created_at?: string;
  path?: string;
  verified_count?: number;
  questions?: MeetingQuestionItem[];
};

export async function postMeetingTranscript(
  meetingId: string,
  payload: MeetingTranscriptPayload,
): Promise<MeetingTranscriptResponse | null> {
  const response = await fetch(
    `https://beachcomber-be-1021189182492.asia-east1.run.app/api/meetings/${encodeURIComponent(meetingId)}/transcript`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`POST /api/meetings/${meetingId}/transcript failed`);
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as MeetingTranscriptResponse;
}
