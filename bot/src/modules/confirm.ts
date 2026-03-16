import { InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { setSession } from '../session.js';
import { getSurveySummary } from './survey.js';

export async function showConfirmation(ctx: Context): Promise<void> {
  const chatId = ctx.chat!.id;
  const summary = getSurveySummary(chatId);
  const keyboard = new InlineKeyboard()
    .text('Всё верно', 'action:confirm_ok')
    .text('Изменить', 'action:confirm_edit').row();
  await ctx.reply(summary, { reply_markup: keyboard });
}

/**
 * Возврат к опросу с начала (при "Изменить").
 */
export async function backToSurvey(ctx: Context): Promise<void> {
  setSession(ctx.chat!.id, {
    step: 'survey',
    surveyAnswers: {},
    surveyQuestionIndex: 0,
  });
  const { SURVEY_QUESTIONS } = await import('../survey-questions.js');
  await ctx.reply('Давайте начнём заново. ' + SURVEY_QUESTIONS[0].text);
}
