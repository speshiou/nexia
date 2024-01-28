'use client'

import { TelegramWebApp } from '@/types/telegram';
import Script from 'next/script';
import React, { createContext, FC, useContext, useState } from 'react';

type WebApp = {
    initialized: boolean,
    webApp?: TelegramWebApp
};

const defaultValue: WebApp = {
    initialized: false,
}

const TelegramContext = createContext<WebApp>(defaultValue);

const TelegramProvider: FC<React.PropsWithChildren> = ({ children }) => {
    const [initialized, setInitialized] = useState(false)

    document.body.classList.add("telegram-app")

    const contextValue: WebApp = {
        initialized,
        webApp: global?.window && global.window.Telegram && window.Telegram.WebApp
    };

    const handleOnLoad = () => {
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