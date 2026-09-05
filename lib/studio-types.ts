export type TranscriptEntry = {
  id: string;
  speaker: "Interviewer" | "Founder";
  text: string;
  timestamp: string;
};

export type FollowupSuggestion = {
  id: string;
  question: string;
  status: "pending" | "adopted" | "dismissed";
};

export type Session = {
  id: string;
  title: string;
  createdAt: string;
  transcriptHistory: TranscriptEntry[];
  aiSuggestions: FollowupSuggestion[];
};

export type SpecRole = "pm" | "uiux" | "frontend" | "backend" | "sa";

export type SpecMap = Record<SpecRole, string>;
