
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`¡Hola! Mi nombre es Nexia, un chatbot de IA impulsado por los modelos GPT, DALL·E y Stable Diffusion de OpenAI.

<b>Funciones adicionales</b>
🧙‍♀️ Chatbot personalizable
🎙 Admite mensajes de voz
🌐 Resume el contenido en enlaces
🎬 Resumir videos de Youtube (hasta 20 minutos de duración)
👥 Chat grupal: agregue este bot a un chat grupal y luego escriba /chatgpt para comenzar.
✍️ /corrector - reescribe oraciones
📔 /diccionario - aprende sobre palabras/frases
👨‍🎨 /image - genera imágenes a partir de texto

Al utilizar este chatbot, aceptas nuestras <a href="{{terms_link}}">condiciones de servicio</a> y nuestra <a href="{{privacy_link}}">política de privacidad</a>.`, args),
  simpleGreeting: `¡Hola! ¿Cómo puedo ayudarle hoy?`,
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => replaceArgs(`ℹ️ <i>Ahora estás chateando con {{role_name}} ({{mode_name}})... </i>`, args),
  settings: `Ajustes`,
}

export default dict
