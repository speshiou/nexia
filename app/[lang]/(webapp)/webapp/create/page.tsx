'use client'

import ImageCreator from "@/components/image_creator";
import { AccountProvider } from "@/components/account-provider";
import Header from "@/components/webapp/header";
import { TelegramProvider } from "@/components/webapp/telegram-provider";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <TelegramProvider>
      <AccountProvider>
        <Header />
        <ImageCreator />
      </AccountProvider>
    </TelegramProvider>
  );
}
