import { AccountProvider } from "@/components/account-provider";
import { TelegramProvider } from "@/components/webapp/telegram-provider";
import WebApp from "@/components/webapp/webapp";
import { getUserMeta } from "@/lib/actions";

export default async function Page() {
  const user = await getUserMeta(true)
  return (
    <TelegramProvider>
      <AccountProvider initialData={user}>
        <WebApp />
      </AccountProvider>
    </TelegramProvider>
  );
}