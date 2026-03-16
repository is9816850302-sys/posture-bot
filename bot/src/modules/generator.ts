import OpenAI from 'openai';
import type { SurveyAnswers } from '../validation.js';
import { ERROR_MESSAGES } from '../errors.js';

const SYSTEM_PROMPT = `Ты помогаешь составить короткую самопрезентацию для женского онлайн-сообщества. 
Текст должен быть тёплым, искренним и структурированным: приветствие, цели в сообществе, интересы, как комфортнее общаться, что важно о себе. 
Пиши от первого лица, без лишней разметки и заголовков — один связный текст для копирования в чат.`;

function buildUserPrompt(answers: SurveyAnswers): string {
  return [
    `Цели в сообществе: ${answers.goals}`,
    `Интересы: ${answers.interests}`,
    `Стиль общения: ${answers.communicationStyle}`,
    `Что важно указать о себе: ${answers.aboutMe}`,
  ].join('\n');
}

export async function generateDraft(answers: SurveyAnswers): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { ok: false, message: ERROR_MESSAGES.UNAVAILABLE };
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(answers) },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return { ok: false, message: ERROR_MESSAGES.GENERATION_FAILED };
    }
    return { ok: true, text };
  } catch {
    return { ok: false, message: ERROR_MESSAGES.GENERATION_FAILED };
  }
}
