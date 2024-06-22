'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import ListGroup from '@/components/widget/list_group'
import ListItem from '@/components/widget/list_item'
import Scaffold from '@/components/widget/scaffold'
import { getSettings } from '@/lib/actions'
import { locales } from '@/lib/locales'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

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

  function handleSelection(e: React.MouseEvent, option: string) {
    e.stopPropagation()
    e.preventDefault()

    // setModel(option, startedForResult)

    router.back()
  }

  return (
    <Scaffold title="UI Language" root={true}>
      <div className={clsx({ 'animate-pulse': isPending })}>
        <ListGroup>
          {Object.values(locales).map((locale) => {
            return (
              <ListItem
                key={locale.id}
                title={locale.title}
                selectionMode="check"
                selected={data?.preferred_lang == locale.id}
                onClick={(e) => handleSelection(e, locale.id)}
              />
            )
          })}
        </ListGroup>
      </div>
    </Scaffold>
  )
}
