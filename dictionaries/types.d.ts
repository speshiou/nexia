
interface LocalizedString {
  greeting: (args: { terms_link: string, privacy_link: string }) => string,
  simpleGreeting: string
  currentChatStatusPattern: (args: { role_name: string, mode_name: string }) => string,
  settings: string
}
