import type { SurveyAnswers } from './validation.js';

export type Step =
  | 'idle'
  | 'survey'
  | 'confirm'
  | 'generating'
  | 'editing'
  | 'final';

export interface SessionData {
  step: Step;
  surveyAnswers: Partial<SurveyAnswers>;
  surveyQuestionIndex: number;
  draft: string;
  finalText: string;
}

const defaultSession: SessionData = {
  step: 'idle',
  surveyAnswers: {},
  surveyQuestionIndex: 0,
  draft: '',
  finalText: '',
};

const sessions = new Map<number, SessionData>();

export function getSession(chatId: number): SessionData {
  let s = sessions.get(chatId);
  if (!s) {
    s = { ...defaultSession };
    sessions.set(chatId, s);
  }
  return s;
}

export function setSession(chatId: number, data: Partial<SessionData>): void {
  const current = getSession(chatId);
  Object.assign(current, data);
}

export function resetSession(chatId: number): void {
  sessions.set(chatId, { ...defaultSession });
}
