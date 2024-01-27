'use client'

import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useTelegram } from './telegram-provider';
import { authTelegram } from '@/lib/actions';
import { Account } from '@/types/types';

type AccountContextType = {
    gems: number;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const AccountProvider: FC<React.PropsWithChildren> = ({ children }) => {
    const [account, setAccount] = useState<Account>({
        _id: 0,
        gems: 0,
    });

    const { initialized, webApp } = useTelegram()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!initialized) return
                const user = await authTelegram(webApp.initData) as Account
                setAccount(user)
            } catch (error) {
                // TODO: error handling
            }
        };

        fetchUserData();
    }, [initialized]);

    const contextValue: AccountContextType = { gems: account.gems };

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