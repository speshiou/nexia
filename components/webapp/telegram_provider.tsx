'use client'

import { TelegramWebApp } from '@/app/telegram';
import Script from 'next/script';
import React, { createContext, FC, useContext, useEffect, useState } from 'react';

type WebApp = {
    initialized: boolean,
    webApp: TelegramWebApp
};

const dummyWebApp: TelegramWebApp = {
    initData: ''
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

    return (
        <TelegramContext.Provider value={contextValue}>
            <Script src="https://telegram.org/js/telegram-web-app.js" onLoad={() => setInitialized(true)}></Script>
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