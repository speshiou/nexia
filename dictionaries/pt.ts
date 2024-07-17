
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`Oi! Meu nome é Nexia, um chatbot de IA desenvolvido com os modelos GPT, DALL·E e Stable Diffusion da OpenAI.

<b>Recursos adicionais</b>
🧙‍♀️ Chatbot personalizável
🎙 Suporte a mensagens de voz
🌐 Resuma o conteúdo em links
🎬 Resuma vídeos do Youtube (até 20 minutos de duração)
👥 Bate-papo em grupo - adicione este bot a um bate-papo em grupo e digite /chatgpt para iniciar.
✍️ /revisor - reescrever frases
📔 /dicionário - aprenda sobre palavras/frases
👨‍🎨 /image - gera imagens a partir de texto

Ao usar este chatbot, você concorda com nossos <a href="{{terms_link}}">termos de serviço</a> e <a href="{{privacy_link}}">política de privacidade</a>.`, args),
  simpleGreeting: `Olá! Como posso ajudá-lo hoje?`,
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => replaceArgs(`ℹ️ <i>Agora você está conversando com {{role_name}} ({{mode_name}}) ... </i>`, args),
  settings: `Configurações`,
}

export default dict
