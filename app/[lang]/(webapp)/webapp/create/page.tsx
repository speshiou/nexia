'use client'

import { TelegramProvider } from "@/components/webapp/telegram-provider";
import WebApp from "@/components/webapp/webapp";

export default function Home() {
  return (
    <TelegramProvider>
      <WebApp />
    </TelegramProvider>
  );
}