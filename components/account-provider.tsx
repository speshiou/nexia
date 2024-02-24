'use client'

import React, { createContext, FC, useContext, useState } from 'react';
import { Account } from '@/types/types';

type AccountContextType = {
    account: Account;
    setAccount: (account: Account) => void
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const AccountProvider: FC<React.PropsWithChildren & {
    "initialAccount": Account | null,
}> = ({ children, initialAccount }) => {
    const [account, setAccount] = useState<Account>(initialAccount || {
        _id: 0,
        gems: 0,
    });

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