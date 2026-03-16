import type { Context } from 'grammy';
import { getSession, setSession } from '../session.js';
import { SURVEY_QUESTIONS } from '../survey-questions.js';
import type { SurveyAnswers } from '../validation.js';
import { validateSurveyAnswers } from '../validation.js';
export function getCurrentQuestion(chatId: number): string | null {
  const session = getSession(chatId);
  const idx = session.surveyQuestionIndex;
  if (idx >= SURVEY_QUESTIONS.length) return null;
  return SURVEY_QUESTIONS[idx].text;
}

export function getCurrentQuestionKey(chatId: number): keyof SurveyAnswers | null {
  const session = getSession(chatId);
  const idx = session.surveyQuestionIndex;
  if (idx >= SURVEY_QUESTIONS.length) return null;
  return SURVEY_QUESTIONS[idx].key;
}

/**
 * Переход к опросу: показать первый вопрос.
 */
export async function startSurvey(ctx: Context): Promise<void> {
  setSession(ctx.chat!.id, {
    step: 'survey',
    surveyAnswers: {},
    surveyQuestionIndex: 0,
  });
  const text = SURVEY_QUESTIONS[0].text;
  await ctx.reply(text);
}

/**
 * Обработка ответа на вопрос опроса: сохранить и показать следующий или перейти к подтверждению.
 */
export async function handleSurveyAnswer(ctx: Context, text: string): Promise<boolean> {
  const chatId = ctx.chat!.id;
  const session = getSession(chatId);
  const idx = session.surveyQuestionIndex;
  if (idx >= SURVEY_QUESTIONS.length) return false;

  const key = SURVEY_QUESTIONS[idx].key;
  const answers = { ...session.surveyAnswers, [key]: text.trim() };
  setSession(chatId, { surveyAnswers: answers, surveyQuestionIndex: idx + 1 });

  const nextIdx = idx + 1;
  if (nextIdx >= SURVEY_QUESTIONS.length) {
    const valid = validateSurveyAnswers(answers);
    if (!valid.ok) {
      await ctx.reply(valid.message);
      return true;
    }
    setSession(chatId, { step: 'confirm' });
    return true; // переход к подтверждению — вызывающий код отправит сводку
  }

  await ctx.reply(SURVEY_QUESTIONS[nextIdx].text);
  return true;
}

export function getSurveySummary(chatId: number): string {
  const session = getSession(chatId);
  const a = session.surveyAnswers;
  const lines: string[] = [];
  lines.push('Проверьте данные:');
  lines.push(`Цели: ${a.goals ?? '—'}`);
  lines.push(`Интересы: ${a.interests ?? '—'}`);
  lines.push(`Стиль общения: ${a.communicationStyle ?? '—'}`);
  lines.push(`О себе: ${a.aboutMe ?? '—'}`);
  return lines.join('\n');
}

export function validateAndMoveToConfirm(chatId: number): { ok: true } | { ok: false; message: string } {
  const session = getSession(chatId);
  const valid = validateSurveyAnswers(session.surveyAnswers);
  if (!valid.ok) return valid;
  setSession(chatId, { step: 'confirm' });
  return { ok: true };
}
