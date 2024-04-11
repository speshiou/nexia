import { getLocalizedText } from '@/lib/i18n'
import { PageProps } from '../../../../types/types'
import ImageCreator from '@/components/image_creator'

export default async function Page({
  params,
}: Readonly<{
  params: PageProps
}>) {
  const _ = await getLocalizedText(params.lang)
  return <ImageCreator />
}
