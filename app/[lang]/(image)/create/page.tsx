import { getLocalizedText } from "@/lib/i18n";
import { PageProps } from "../../../types";
import CreateImageTextInput from "@/components/create_image_text_input";
import { CreateImageTaskProvider } from "@/components/create_image_task";
import CreateImageResults from "@/components/create_image_results";
import CreateImageRefDropArea from "@/components/create_image_ref_drop_area";

export default async function Home({ params }: Readonly<{
  children: React.ReactNode,
  params: PageProps
}>) {
  const _ = await getLocalizedText(params.lang)
  return (
    <main className="m-10">
      <CreateImageTaskProvider>
        <CreateImageTextInput />
        <CreateImageRefDropArea />
        <CreateImageResults />
      </CreateImageTaskProvider>
    </main>
  );
}
