import { InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { getSession, setSession, resetSession } from '../session.js';

const SUCCESS_MSG =
  'Готово. Скопируйте текст ниже и отправьте его в чат сообщества.';

export function getFinalText(chatId: number): string {
  const session = getSession(chatId);
  return session.finalText || session.draft || '';
}

export async function showFinal(ctx: Context): Promise<void> {
  const chatId = ctx.chat!.id;
  const text = getFinalText(chatId);
  setSession(chatId, { step: 'final' });
  const keyboard = new InlineKeyboard()
    .text('Сохранить', 'action:final_save')
    .text('Повторить', 'action:final_restart').row();
  await ctx.reply('Итоговая самопрезентация:');
  await ctx.reply(text, { reply_markup: keyboard });
}

export async function onSave(ctx: Context): Promise<void> {
  const chatId = ctx.chat!.id;
  const text = getFinalText(chatId);
  await ctx.reply(SUCCESS_MSG);
  await ctx.reply(text);
}

export async function onRestart(ctx: Context): Promise<void> {
  resetSession(ctx.chat!.id);
  await ctx.reply('Сессия сброшена. Нажмите /start, чтобы начать заново.');
}
