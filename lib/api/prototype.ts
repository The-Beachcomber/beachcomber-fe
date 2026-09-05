export async function generatePrototype(payload: {
  sessionId: string | null;
  transcriptWordCount: number;
}) {
  // API TODO: POST /api/prototypes/generate
  return Promise.resolve({ ok: true, ...payload });
}

export async function restorePrototypeById(prototypeId: string) {
  // API TODO: GET /api/prototypes/:id
  return Promise.resolve({ ok: true, prototypeId });
}
