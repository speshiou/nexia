import { TelegramProvider } from "@/components/webapp/telegram-provider";

export default function Home() {
  return (
    <TelegramProvider auth={true}>
    </TelegramProvider>
  );
}
