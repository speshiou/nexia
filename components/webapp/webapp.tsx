'use client'

import { useTelegram } from "./telegram-provider"
import Header from './header'
import { AccountProvider } from '../account-provider'
import ImageCreator from './image_creator'
import { CreateImageTaskProvider } from '../create-image-task'

// utilize s singleton to prevent the handler from being repeatedly registered 
const handleMainButtonClick = () => {
    (document.querySelector("[type=submit]") as HTMLButtonElement).click()
}

export default function WebApp() {
    const { webApp } = useTelegram()

    // the component may be instantiated multiple times
    webApp?.MainButton?.offClick(handleMainButtonClick)
    webApp?.MainButton?.onClick(handleMainButtonClick)

    return (
        <AccountProvider>
            <Header />
            <CreateImageTaskProvider>
                <ImageCreator />
            </CreateImageTaskProvider>
        </AccountProvider>
    )
}
