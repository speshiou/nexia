import CreateImageTextInput from "@/components/create-image-input";
import CreateImageContent from "@/components/create-image-content";
import { useTelegram } from "./telegram-provider";
import colors from "tailwindcss/colors";
import { useCreateImageTask } from "../create-image-task";

export default function ImageCreator() {
  const { webApp } = useTelegram()
  const { taskState, outputType } = useCreateImageTask()

  if (taskState == "processing") {
    webApp?.MainButton?.setParams({
      text: "Creating ...",
      color: colors.indigo["600"],
      text_color: colors.white,
      is_active: false,
      is_visible: true,
    })
    webApp?.MainButton?.showProgress()
  } else {
    webApp?.MainButton?.setParams({
      text: outputType == "image" ? "Create Images for 1 💎" : "Create Video for 2 💎",
      color: colors.indigo["600"],
      text_color: colors.white,
      is_active: true,
      is_visible: true,
    })
    webApp?.MainButton?.hideProgress()
  }

  return (
    <main className="m-4 lg:m-10">
      <CreateImageTextInput hideSubmitButton={true} />
      <CreateImageContent />
    </main>
  );
}
