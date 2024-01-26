import { getLocalizedText } from "@/lib/i18n";
import { PageProps } from "../../../types";
import ImageCreator from "@/components/image_creator";

export default async function Home({ params }: Readonly<{
  children: React.ReactNode,
  params: PageProps
}>) {
  const _ = await getLocalizedText(params.lang)
  return (
    <ImageCreator />
  );
}
