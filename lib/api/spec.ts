export async function generateSpecsFromPrototype(payload: {
  sessionId: string | null;
  stage: "preview-confirmed";
}) {
  // API TODO: POST /api/specs/generate
  return Promise.resolve({ ok: true, ...payload });
}

export async function exportSpecsDocument(payload: {
  format: "pdf" | "doc";
  role: "pm" | "uiux" | "frontend" | "backend" | "sa";
}) {
  // API TODO: POST /api/specs/export
  return Promise.resolve({ ok: true, ...payload });
}
