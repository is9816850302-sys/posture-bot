import { InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { getSession, setSession } from '../session.js';
import { validateEditText } from '../validation.js';
const SAVED_MSG = 'Сохранено. Отправьте ещё правки или нажмите «Готово».';

export function getDraft(chatId: number): string {
  return getSession(chatId).draft;
}

/**
 * Сохранить правку текста в сессию и ответить пользователю.
 */
export async function handleEdit(ctx: Context, text: string): Promise<boolean> {
  const chatId = ctx.chat!.id;
  const result = validateEditText(text);
  if (!result.ok) {
    await ctx.reply(result.message);
    return true;
  }
  setSession(chatId, { finalText: text.trim() });
  await ctx.reply(SAVED_MSG, {
    reply_markup: new InlineKeyboard().text('Готово', 'action:editor_done'),
  });
  return true;
}

export async function showEditorPrompt(ctx: Context): Promise<void> {
  const chatId = ctx.chat!.id;
  const draft = getSession(chatId).draft;
  const keyboard = new InlineKeyboard().text('Готово', 'action:editor_done');
  await ctx.reply(
    'Отредактируйте текст при необходимости. Отправьте новую версию сообщением или нажмите «Готово», если всё подходит.',
    { reply_markup: keyboard }
  );
  if (draft) {
    await ctx.reply(`Текущий текст:\n\n${draft}`);
  }
}
