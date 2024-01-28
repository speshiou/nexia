'use client'

import { useTelegram } from "./telegram-provider"
import Header from './header'
import { AccountProvider } from '../account-provider'
import ImageCreator from './image_creator'
import { CreateImageTaskProvider } from '../create-image-task'

export default function WebApp() {
    const { webApp } = useTelegram()

    webApp?.MainButton?.onClick(() => {
        (document.querySelector("[type=submit]") as HTMLButtonElement).click()
    })

    return (
        <AccountProvider>
            <Header />
            <CreateImageTaskProvider>
                <ImageCreator />
            </CreateImageTaskProvider>
        </AccountProvider>
    )
}
