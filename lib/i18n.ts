import { dictionaries } from '@/dictionaries/resources'

export async function getLocalizedText(locale: string) {
  const dict = await getDictionary(locale)
  return (text: string) => dict[text] || text
}

const getDictionary = async (locale: string) => dictionaries[locale]()
