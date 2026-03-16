import { InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { setSession } from '../session.js';

const WELCOME = `Привет! Я помогу подготовить самопрезентацию для чата женского сообщества.

Коротко: вы ответите на несколько вопросов о целях, интересах и стиле общения, я сформирую черновик текста, вы сможете его отредактировать и получить готовое сообщение для отправки в чат.

Данные нигде не сохраняются — только в рамках нашей беседы.`;

export async function handleStart(ctx: Context): Promise<void> {
  setSession(ctx.chat!.id, { step: 'idle' });
  const keyboard = new InlineKeyboard().text('Начать', 'action:start_survey');
  await ctx.reply(WELCOME, { reply_markup: keyboard });
}
