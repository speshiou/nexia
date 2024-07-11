export function replaceArgs(text: string, args: { [key: string]: any }) {
  if (args && Object.entries(args).length) {
    Object.entries(args).forEach(([key, value]) => {
      text = text.replaceAll(new RegExp(`\{\{\s*${key}\s*\}\}`), String(value))
    })
  }
  return text
}
