import type { MeetingTranscriptPayload } from "./meetings";

export type MeetingPrototypeResponse = {
  prototypes: string;
};

export async function generatePrototype(
  meetingId: string,
  payload: MeetingTranscriptPayload,
): Promise<MeetingPrototypeResponse> {
  const response = await fetch(
    `/api/meetings/${encodeURIComponent(meetingId)}/prototypes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`POST /api/meetings/${meetingId}/prototypes failed`);
  }

  return (await response.json()) as MeetingPrototypeResponse;
}

export async function restorePrototypeById(prototypeId: string) {
  // API TODO: GET /api/prototypes/:id
  return Promise.resolve({ ok: true, prototypeId });
}
