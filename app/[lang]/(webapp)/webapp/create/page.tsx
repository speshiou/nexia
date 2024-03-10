import { AccountProvider } from "@/components/account-provider";
import { TelegramProvider } from "@/components/webapp/telegram-provider";
import WebApp from "@/components/webapp/webapp";
import { getUser } from "@/lib/actions";
import { Account } from "@/types/types";

export default async function Page() {
  const account: Account | null =  await getUser(true)
  return (
    <TelegramProvider>
      <AccountProvider initialAccount={account}>
        <WebApp />
      </AccountProvider>
    </TelegramProvider>
  );
}