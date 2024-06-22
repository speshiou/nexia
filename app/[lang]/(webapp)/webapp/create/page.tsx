import { AccountProvider } from '@/components/account-provider'
import WebApp from '@/components/webapp/webapp'
import { getUserMeta } from '@/lib/actions'

export default async function Page() {
  const user = await getUserMeta(true)
  return (
    <AccountProvider initialData={user}>
      <WebApp />
    </AccountProvider>
  )
}
