const base = {
  greeting: `Hi! My name is Nexia, an AI chatbot powered by OpenAI's GPT, DALL·E and Stable Diffusion models.

<b>Additional features</b>
🧙‍♀️ Customizable chatbot
🎙 Support voice messages
🌐 Summarize the content in links
🎬 Summarize Youtube videos (up to 20 minutes long)
👥 Group chat - add this bot to a group chat, then type /chatgpt to start.
✍️ /proofreader - rewrite sentences
📔 /dictionary - learn about words/phrases
👨‍🎨 /image - generate images from text

By using this chatbot, you agree to our <a href="{{terms_link}}">terms of service</a> and <a href="{{privacy_link}}">privacy policy</a>.`,
  simpleGreeting: 'Hello! How can I assist you today?',
  currentChatStatusPattern: `ℹ️ <i>You're now chatting with {{role_name}} ({{mode_name}}) ... </i>`,
  settings: 'Settings',
}

export default base
