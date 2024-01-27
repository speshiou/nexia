'use client'

import { TelegramWebApp } from '@/types/telegram';
import { signIn } from 'next-auth/react';
import Script from 'next/script';
import React, { createContext, FC, useContext, useEffect, useState } from 'react';

type WebApp = {
    initialized: boolean,
    webApp: TelegramWebApp
};

const dummyWebApp: TelegramWebApp = {
    initData: '',
    ready: function (): void { },
    expand: function (): void { }
}

const defaultValue: WebApp = {
    initialized: false,
    webApp: dummyWebApp,
}

const TelegramContext = createContext<WebApp>(defaultValue);

const TelegramProvider: FC<React.PropsWithChildren> = ({ children }) => {
    const [initialized, setInitialized] = useState(false)

    const contextValue: WebApp = {
        initialized,
        webApp: global?.window && global.window.Telegram && window.Telegram.WebApp
    };

    const handleOnLoad = async () => {
        if (initialized) {
            return
        }
        window.Telegram.WebApp.ready()
        window.Telegram.WebApp.expand()

        await signIn(
            "telegram-login",
            { callbackUrl: '/webapp' },
            window.Telegram.WebApp.initData,
        )
        setInitialized(true)
    }

    return (
        <TelegramContext.Provider value={contextValue}>
            <Script src="https://telegram.org/js/telegram-web-app.js" onLoad={handleOnLoad}></Script>
            {children}
        </TelegramContext.Provider>
    );
};

const useTelegram = () => {
    const context = useContext(TelegramContext);
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
};

export { TelegramProvider, useTelegram };