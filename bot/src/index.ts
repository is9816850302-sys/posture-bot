import 'dotenv/config';
import { Bot } from 'grammy';
import { handleStart } from './modules/start.js';
import { startSurvey, handleSurveyAnswer } from './modules/survey.js';
import { backToSurvey, showConfirmation } from './modules/confirm.js';
import { generateDraft } from './modules/generator.js';
import { showEditorPrompt, handleEdit } from './modules/editor.js';
import { showFinal, onSave, onRestart } from './modules/final.js';
import { getSession, setSession } from './session.js';
import type { SurveyAnswers } from './validation.js';

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is required. Create bot/.env from .env.example');
  process.exit(1);
}

const bot = new Bot(token);

// Callback: Начать → опрос
bot.callbackQuery('action:start_survey', async (ctx) => {
  await ctx.answerCallbackQuery();
  await startSurvey(ctx);
});

// Callback: Всё верно → генерация
bot.callbackQuery('action:confirm_ok', async (ctx) => {
  await ctx.answerCallbackQuery();
  const chatId = ctx.chat!.id;
  setSession(chatId, { step: 'generating' });
  await ctx.reply('Генерирую текст…');

  const sess = getSession(chatId);
  const answers = sess.surveyAnswers as Partial<SurveyAnswers>;
  const result = await generateDraft(answers as SurveyAnswers);

  if (!result.ok) {
    await ctx.reply(result.message);
    setSession(chatId, { step: 'confirm' });
    return;
  }

  setSession(chatId, {
    step: 'editing',
    draft: result.text,
    finalText: result.text,
  });
  await ctx.reply('Черновик самопрезентации:');
  await ctx.reply(result.text);
  await showEditorPrompt(ctx);
});

// Callback: Изменить → снова опрос
bot.callbackQuery('action:confirm_edit', async (ctx) => {
  await ctx.answerCallbackQuery();
  await backToSurvey(ctx);
});

// Callback: Готово (редактор) → финал
bot.callbackQuery('action:editor_done', async (ctx) => {
  await ctx.answerCallbackQuery();
  const chatId = ctx.chat!.id;
  const sess = getSession(chatId);
  setSession(chatId, {
    finalText: sess.finalText || sess.draft,
    step: 'final',
  });
  await showFinal(ctx);
});

// Callback: Сохранить (финал)
bot.callbackQuery('action:final_save', async (ctx) => {
  await ctx.answerCallbackQuery();
  await onSave(ctx);
});

// Callback: Повторить (финал)
bot.callbackQuery('action:final_restart', async (ctx) => {
  await ctx.answerCallbackQuery();
  await onRestart(ctx);
});

// /start
bot.command('start', async (ctx) => {
  await handleStart(ctx);
});

// Текстовые сообщения по шагам
bot.on('message:text', async (ctx) => {
  const chatId = ctx.chat!.id;
  const text = ctx.message.text;
  const sess = getSession(chatId);

  switch (sess.step) {
    case 'survey': {
      const handled = await handleSurveyAnswer(ctx, text);
      if (handled) {
        const nextSess = getSession(chatId);
        if (nextSess.step === 'confirm') {
          await showConfirmation(ctx);
        }
      }
      return;
    }
    case 'editing': {
      await handleEdit(ctx, text);
      return;
    }
    default:
      await ctx.reply('Отправьте /start, чтобы начать.');
  }
});

// Глобальная обработка ошибок
bot.catch((err) => {
  console.error('Bot error:', err);
});

bot.start({
  onStart: (info) => console.log(`Bot @${info.username} started`),
}).catch((e) => {
  console.error('Failed to start bot:', e);
  process.exit(1);
});
