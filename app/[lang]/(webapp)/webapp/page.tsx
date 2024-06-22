'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import LoadingSkeleton from '@/components/widget/LoadingSkeleton'
import ListGroup from '@/components/widget/list_group'
import ListItem from '@/components/widget/list_item'
import Scaffold from '@/components/widget/scaffold'
import { getSettings } from '@/lib/actions'
import { defaultLocaleId, locales } from '@/lib/locales'
import { defaultModelId, models } from '@/lib/models'
import { defaultRoleId, roles } from '@/lib/roles'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const pathname = usePathname()

  const { isPending, error, data } = useQuery({
    queryKey: ['query_settings', initialized],
    queryFn: () => {
      const app = webApp
      if (!app) return null
      return getSettings(app.initData).then((result) => result)
    },
  })

  const allRoles: Record<string, any> = {
    ...roles,
  }

  console.log(allRoles)

  return (
    <Scaffold title="Settings" root={true}>
      <div className={clsx({ 'animate-pulse': isPending })}>
        <ListGroup>
          <ListItem
            to={`${pathname}/models`}
            title="AI Model"
            trailing={
              models[data?.current_model || defaultModelId].title || (
                <LoadingSkeleton />
              )
            }
          />
          <ListItem
            to={`${pathname}/roles`}
            title="Role"
            trailing={
              allRoles[data?.current_chat_mode || defaultRoleId].name || (
                <LoadingSkeleton />
              )
            }
          />
        </ListGroup>

        <ListGroup>
          <ListItem
            title="Remaining tokens"
            trailing={
              data?.remaining_tokens.toLocaleString() || <LoadingSkeleton />
            }
          />
          <ListItem to={`${pathname}/purchase`} title="Purchase more tokens" />
        </ListGroup>
        <ListGroup>
          <ListItem
            to={`${pathname}/lang`}
            title="UI Language"
            trailing={
              locales[data?.preferred_lang || defaultLocaleId].title || (
                <LoadingSkeleton />
              )
            }
          />
          <ListItem to={`${pathname}/bots`} title="Bots created by Nexia" />
          <ListItem to="https://t.me/nexia_support" title="Feedback" />
        </ListGroup>
      </div>
    </Scaffold>
  )
}
