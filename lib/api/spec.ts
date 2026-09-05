/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 13:31:36
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-06 04:06:12
 * @FilePath: /beachcomber-fe/lib/api/spec.ts
 */
export type SpecGenerationRole = "pm" | "eng" | "ui" | "qa";

export type MeetingSpecsRequest = {
  roles: SpecGenerationRole[];
  transcript: string;
  prototypes: string;
};

export type MeetingSpecsItem = {
  role: SpecGenerationRole;
  spec: string;
};

export type MeetingSpecsResponse = {
  response: MeetingSpecsItem[];
};

export async function generateMeetingSpecs(
  meetingId: string,
  payload: MeetingSpecsRequest,
): Promise<MeetingSpecsResponse> {
  const response = await fetch(
    `https://beachcomber-be-1021189182492.asia-east1.run.app/api/meetings/${encodeURIComponent(meetingId)}/specs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`POST /api/meetings/${meetingId}/specs failed`);
  }

  return (await response.json()) as MeetingSpecsResponse;
}

export async function generateSpecsFromPrototype(payload: {
  sessionId: string | null;
  stage: "preview-confirmed";
}) {
  // API TODO: POST /api/specs/generate
  return Promise.resolve({ ok: true, ...payload });
}

export async function exportSpecsDocument(payload: {
  format: "pdf" | "doc";
  role: SpecGenerationRole;
}) {
  // API TODO: POST /api/specs/export
  return Promise.resolve({ ok: true, ...payload });
}
