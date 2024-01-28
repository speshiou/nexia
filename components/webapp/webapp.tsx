'use client'

import colors from 'tailwindcss/colors'
import ImageCreator from "../image_creator"
import { useTelegram } from "./telegram-provider"
import Header from './header'

export default function WebApp() {
    const { webApp } = useTelegram()

    webApp?.MainButton?.setParams({
        text: "Create",
        color: colors.indigo["600"],
        text_color: colors.white,
        is_active: true,
        is_visible: true,
    })
    webApp?.MainButton?.hideProgress()

    return (
        <>
            <Header />
            <ImageCreator />
        </>
    )
}
