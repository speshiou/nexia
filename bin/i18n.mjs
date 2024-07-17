import fs from 'fs'
import path from 'path'
import supportedLocales from '../locales.json' with { type: 'json' }
const supportedLangCodes = Object.keys(supportedLocales)
import base from '../dictionaries/base.mjs'
import { TranslationServiceClient } from '@google-cloud/translate'

const OUTPUT_DIR = 'dictionaries'

const translationClient = new TranslationServiceClient({
  projectId: process.env.GCP_PROJECT_ID,
})

let props = []
for (const key of Object.keys(base)) {
  const value = base[key]
  const tags = findUniqueTags(value)
  if (tags.length > 0) {
    props.push(
      `  ${key}: (args: { ${tags.map((tag) => `${tag}: string`).join(', ')} }) => string,`,
    )
  } else {
    props.push(`  ${key}: string`)
  }
}

const typeContent = `
interface LocalizedString {
${props.join('\n')}
}
`

fs.writeFileSync(path.join(OUTPUT_DIR, 'types.d.ts'), typeContent)

async function trans(text, sourceLocale, targetLocale) {
  if (sourceLocale == targetLocale) {
    return text
  }
  let [response] = await translationClient.translateText({
    parent: `projects/${process.env.GCP_PROJECT_ID}/locations/us-central1`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode: sourceLocale,
    targetLanguageCode: targetLocale,
  })

  return response.translations[0].translatedText
}

function findUniqueTags(text) {
  const pattern = /\{\{\s*(.*?)\s*\}\}/g
  const uniqueTags = new Set()

  text.replace(pattern, (match, tag) => {
    uniqueTags.add(tag.trim())
    return ''
  })

  return Array.from(uniqueTags)
}

async function generate(locale) {
  console.log(`generating ${locale} ...`)
  const tasks = Object.entries(base).map(async ([key, value]) => {
    const tags = findUniqueTags(value)
    const translatedString = await trans(value, 'en', locale)
    if (tags.length > 0) {
      return `  ${key}: (args: { ${tags.map((tag) => `${tag}: string`).join(', ')} }) => replaceArgs(\`${translatedString}\`, args),`
    }
    return `  ${key}: \`${translatedString}\`,`
  })
  const propsText = (await Promise.all(tasks)).join('\n')
  let content = `
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
${propsText}
}

export default dict
`
  fs.writeFileSync(path.join(OUTPUT_DIR, `${locale}.ts`), content)
}

function generateDicts() {
  let dictText = supportedLangCodes
    .map((locale) => {
      return `  "${locale}": async () => (await import('./${locale}')).default,`
    })
    .join('\n')

  let content = `
const dictionaries = {
${dictText}
}

export default dictionaries
      `
  fs.writeFileSync(path.join(OUTPUT_DIR, 'resources.ts'), content)
}

generateDicts()

Promise.all(supportedLangCodes.map((locale) => generate(locale)))
  .then(() => {})
  .catch((e) => console.log(e))
