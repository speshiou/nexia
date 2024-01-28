'use client'

import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { useTelegram } from './webapp/telegram-provider';
import { Account } from '@/types/types';
import { getUser } from '@/lib/actions';

type AccountContextType = {
    account: Account;
    setAccount: (account: Account) => void
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const AccountProvider: FC<React.PropsWithChildren> = ({ children }) => {
    const [account, setAccount] = useState<Account>({
        _id: 0,
        gems: 0,
    });

    const { initialized } = useTelegram()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!initialized) return

                const user = await getUser()
                if (user) {
                    setAccount(user)
                }
                // TODO: error handling
            } catch (error) {
                // TODO: error handling
            }
        };

        fetchUserData();
    }, [initialized]);

    const contextValue: AccountContextType = { account, setAccount };

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