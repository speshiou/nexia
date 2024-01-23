type Dictionary = () => Promise<{ [key: string]: string }>;

export const dictionaries: { [key: string]: Dictionary } = {
  "en": () => import('./en/resource.json').then((module) => module.default),
  "es": () => import('./es/resource.json').then((module) => module.default),
  "pt": () => import('./pt/resource.json').then((module) => module.default),
  "fr": () => import('./fr/resource.json').then((module) => module.default),
  "id": () => import('./id/resource.json').then((module) => module.default),
  "ru": () => import('./ru/resource.json').then((module) => module.default),
  "ko": () => import('./ko/resource.json').then((module) => module.default),
  "ja": () => import('./ja/resource.json').then((module) => module.default),
  "zh": () => import('./zh/resource.json').then((module) => module.default),
  "zh-hant": () => import('./zh-hant/resource.json').then((module) => module.default),
}