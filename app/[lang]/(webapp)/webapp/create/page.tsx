'use client'

import { AccountProvider } from "@/components/account-provider";
import { TelegramProvider } from "@/components/webapp/telegram-provider";
import WebApp from "@/components/webapp/webapp";

export default function Home() {
  return (
    <TelegramProvider>
      <AccountProvider>
        <WebApp />
      </AccountProvider>
    </TelegramProvider>
  );
}