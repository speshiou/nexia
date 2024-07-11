
interface LocalizedString {
  greeting: (args: { terms_link: string, privacy_link: string }) => string,
  settings: (args: {  }) => string,
}
