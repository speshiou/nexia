'use client'

import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useTelegram } from './telegram_provider';
import { authTelegram } from '@/lib/actions';

type Account = {
    gems: number | null;
};

type AccountContextType = {
    account: Account;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const AccountProvider: FC<React.PropsWithChildren> = ({ children }) => {
    const [account, setAccount] = useState<Account>({
        gems: null,
    });

    const { initialized, webApp } = useTelegram()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!initialized) return
                const response = await authTelegram(webApp.initData);
                console.log(response)
                console.log(webApp.initData)
                // if (response.ok) {
                //     //   const userData: User = await response.json();
                //     //   setUser(userData);
                // } else {
                //     throw new Error('Failed to fetch user data');
                // }
            } catch (error) {
                // TODO: error handling
            }
        };

        fetchUserData();
    }, [initialized]);

    const contextValue: AccountContextType = { account };

    return <AccountContext.Provider value={contextValue}>{children}</AccountContext.Provider>;
};

const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
};

export { AccountProvider, useAccount };