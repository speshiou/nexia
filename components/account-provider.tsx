'use client'

import { UserMeta } from '@/types/types';
import React, { createContext, FC, useContext, useState } from 'react';

type AccountContextType = {
    account: UserMeta;
    setAccount: (account: UserMeta) => void
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const AccountProvider: FC<React.PropsWithChildren & {
    initialData: UserMeta,
}> = ({ children, initialData }) => {
    const [account, setAccount] = useState(initialData)

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