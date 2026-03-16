"""
Минимальный Telegram-бот для запуска WebApp анализа осанки.

Переменные окружения:
    BOT_TOKEN   — токен бота от @BotFather
    WEBAPP_URL  — публичный URL до /tg (например https://xxxx.ngrok.io/tg)
"""

import os

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
WEBAPP_URL = os.environ.get("WEBAPP_URL", "https://your-domain.com/tg")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = [[
        InlineKeyboardButton(
            text="\U0001F3C3 Проверить осанку",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    ]]
    await update.message.reply_text(
        "Привет! Я помогу проанализировать вашу осанку.\n\n"
        "Нажмите кнопку ниже — откроется камера, сделайте "
        "проходку, и через 30 секунд получите отчёт.",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


def main() -> None:
    if not BOT_TOKEN:
        raise SystemExit("Установите переменную окружения BOT_TOKEN")
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("Бот запущен…")
    app.run_polling()


if __name__ == "__main__":
    main()
