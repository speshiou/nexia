import fs from 'fs'
import path from 'path'
import supportedLocales from '../locales.json' with { type: 'json' }
const supportedLangCodes = Object.keys(supportedLocales)
import base from '../dictionaries/base.mjs'

const OUTPUT_DIR = 'dictionaries'

let props = []
for (const key of Object.keys(base)) {
  const value = base[key]
  const tags = findUniqueTags(value)
  if (tags) {
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

function translate(text, sourceLocale, targetLocale) {
  return text
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

function generate(locale) {
  const propsText = Object.entries(base)
    .map(([key, value]) => {
      const tags = findUniqueTags(value)
      const translatedString = translate(value)
      if (tags) {
        return `  ${key}: (args: { ${tags.map((tag) => `${tag}: string`).join(', ')} }) => replaceArgs(\`${translatedString}\`, args),`
      }
      return `  ${key}: \`${translatedString}\`,`
    })
    .join('\n')
  let content = `
import { replaceArgs } from './i18n'

const dict: LocalizedString = {
${propsText}
}

export default dict
`
  fs.writeFileSync(path.join(OUTPUT_DIR, `${locale}.ts`), content)
}

for (const locale of supportedLangCodes) {
  generate(locale)
}
