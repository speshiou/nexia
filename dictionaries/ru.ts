
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`Привет! Меня зовут Nexia, я чат-бот с искусственным интеллектом, основанный на моделях OpenAI GPT, DALL·E и Stable Diffusion.

<b>Дополнительные функции</b>
🧙‍♀️ Настраиваемый чат-бот
🎙 Поддержка голосовых сообщений
🌐 Обобщите содержание в ссылках
🎬 Обобщить видео на Youtube (продолжительностью до 20 минут)
👥 Групповой чат — добавьте этого бота в групповой чат, затем введите /chatgpt, чтобы начать.
✍️ /корректор – переписывать предложения
📔 /dictionary - узнать о словах/фразах
👨‍🎨 /image — генерировать изображения из текста

Используя этого чат-бота, вы соглашаетесь с нашими <a href="{{terms_link}}">условиями использования</a> и <a href="{{privacy_link}}">политикой конфиденциальности</a>.`, args),
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => replaceArgs(`ℹ️ <i>Вы сейчас общаетесь с {{role_name}} ({{mode_name}}) ... </i>`, args),
  settings: (args: {  }) => replaceArgs(`Настройки`, args),
}

export default dict
