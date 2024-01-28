import { useEffect } from "react"
import { useTelegram } from "./telegram-provider"
import { signIn } from "next-auth/react"
import colors from "tailwindcss/colors"
import { PaintBrushIcon } from "@heroicons/react/24/outline"

export default function Placeholder() {
    const { initialized, webApp } = useTelegram()

    useEffect(() => {
        const vaildate = async () => {
            await signIn(
                "telegram-login",
                { callbackUrl: '/webapp/create' },
                webApp?.initData,
            )
            // TODO: handle errors
        }

        if (initialized) {
            vaildate()
        }
    }, [initialized])

    webApp?.ready()
    webApp?.expand()
    webApp?.MainButton?.setParams({
        text: "Loading ...",
        color: colors.indigo["600"],
        text_color: colors.white,
        is_active: false,
        is_visible: true,
    })
    webApp?.MainButton?.showProgress()

    return <div className="flex items-center justify-center w-full absolute top-0 bottom-0">
        <PaintBrushIcon className="h-10 w-10 text-gray-500 dark:text-gray-400" />
    </div>
}