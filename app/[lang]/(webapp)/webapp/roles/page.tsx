'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import ListGroup from '@/components/widget/list_group'
import ListItem from '@/components/widget/list_item'
import Scaffold from '@/components/widget/scaffold'
import { getSettings, updateSettings } from '@/lib/actions'
import { roles } from '@/lib/roles'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const router = useRouter()
  const { isPending, error, data } = useQuery({
    queryKey: ['query_settings', initialized],
    queryFn: () => {
      const app = webApp
      if (!app) return null
      return getSettings(app.initData).then((result) => result)
    },
  })

  const searchParams = useSearchParams()

  const startedForResult = searchParams.get('start_for_result')

  async function handleSelection(e: React.MouseEvent, option: string) {
    e.stopPropagation()
    e.preventDefault()

    await updateSettings({ current_chat_mode: option }, webApp?.initData || '')

    if (startedForResult) {
      webApp?.close()
    } else {
      router.back()
    }
  }

  return (
    <Scaffold title="Role" root={true}>
      <div className={clsx({ 'animate-pulse': isPending })}>
        <ListGroup>
          {Object.values(roles).map((role) => {
            return (
              <ListItem
                key={role.id}
                title={role.name}
                selectionMode="check"
                selected={data?.current_chat_mode == role.id}
                onClick={(e) => handleSelection(e, role.id)}
              />
            )
          })}
        </ListGroup>
      </div>
    </Scaffold>
  )
}
