import { PageProps } from '../../../../types/types'
import ImageCreator from '@/components/image_creator'

export default async function Page({
  params,
}: Readonly<{
  params: PageProps
}>) {
  return <ImageCreator />
}
