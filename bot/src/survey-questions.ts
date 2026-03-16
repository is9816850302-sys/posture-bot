import type { SurveyAnswers } from './validation.js';

export interface SurveyQuestion {
  key: keyof SurveyAnswers;
  text: string;
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  { key: 'goals', text: 'Какие у вас цели в этом сообществе? (например: знакомства, поддержка, обмен опытом)' },
  { key: 'interests', text: 'О чём вам интересно говорить? Напишите несколько тем или увлечений.' },
  { key: 'communicationStyle', text: 'Как вам комфортнее общаться: коротко и по делу или подробнее, с историями?' },
  { key: 'aboutMe', text: 'Что важно указать о себе в самопрезентации? (род занятий, семья, хобби — что считаете нужным)' },
];
