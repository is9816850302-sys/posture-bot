import { ERROR_MESSAGES } from './errors.js';

export const MAX_TEXT_LENGTH = 2000;

export interface SurveyAnswers {
  goals: string;
  interests: string;
  communicationStyle: string;
  aboutMe: string;
}

const REQUIRED_KEYS: (keyof SurveyAnswers)[] = ['goals', 'interests', 'communicationStyle', 'aboutMe'];

/**
 * Проверяет, что все обязательные поля опроса заполнены (не пустая строка).
 */
export function validateSurveyAnswers(answers: Partial<SurveyAnswers>): { ok: true } | { ok: false; message: string } {
  for (const key of REQUIRED_KEYS) {
    const value = answers[key];
    if (value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return { ok: false, message: ERROR_MESSAGES.REQUIRED_FIELD };
    }
  }
  return { ok: true };
}

/**
 * Проверяет текст при редактировании: не пустой и не превышает лимит.
 */
export function validateEditText(text: string): { ok: true } | { ok: false; message: string } {
  const t = text.trim();
  if (t === '') return { ok: false, message: ERROR_MESSAGES.TEXT_EMPTY };
  if (t.length > MAX_TEXT_LENGTH) return { ok: false, message: ERROR_MESSAGES.TEXT_TOO_LONG };
  return { ok: true };
}
