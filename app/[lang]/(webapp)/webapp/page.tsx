'use client'

import ImageCreator from "@/components/image_creator";
import { AccountProvider } from "@/components/webapp/account_provider";
import { TelegramProvider } from "@/components/webapp/telegram_provider";

export default function Home() {
  return (    
    <TelegramProvider>
      <AccountProvider>
        <ImageCreator />
      </AccountProvider>
    </TelegramProvider>
  );
}
