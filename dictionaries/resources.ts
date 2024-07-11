
const dictionaries = {
  "en": async () => (await import('./en')).default,
  "es": async () => (await import('./es')).default,
  "pt": async () => (await import('./pt')).default,
  "fr": async () => (await import('./fr')).default,
  "id": async () => (await import('./id')).default,
  "ru": async () => (await import('./ru')).default,
  "ko": async () => (await import('./ko')).default,
  "ja": async () => (await import('./ja')).default,
  "zh": async () => (await import('./zh')).default,
  "zh-hant": async () => (await import('./zh-hant')).default,
}

export default dictionaries
      