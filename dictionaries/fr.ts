
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
  greeting: (args: { terms_link: string, privacy_link: string }) => replaceArgs(`Salut! Je m'appelle Nexia, un chatbot IA alimenté par les modèles GPT, DALL·E et Stable Diffusion d'OpenAI.

<b>Fonctionnalités supplémentaires</b>
🧙‍♀️ Chatbot personnalisable
🎙 Prise en charge des messages vocaux
🌐 Résumer le contenu dans les liens
🎬 Résumer des vidéos Youtube (jusqu'à 20 minutes)
👥 Discussion de groupe : ajoutez ce bot à une discussion de groupe, puis tapez /chatgpt pour commencer.
✍️ /correcteur - réécrire des phrases
📔 /dictionnaire - découvrez les mots/phrases
👨‍🎨 /image - générer des images à partir du texte

En utilisant ce chatbot, vous acceptez nos <a href="{{terms_link}}">conditions d'utilisation</a> et notre <a href="{{privacy_link}}">politique de confidentialité</a>.`, args),
  simpleGreeting: `Bonjour! Comment puis-je vous aider aujourd'hui ?`,
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => replaceArgs(`ℹ️ <i>Vous discutez maintenant avec {{role_name}} ({{mode_name}}) ... </i>`, args),
  settings: `Paramètres`,
}

export default dict
