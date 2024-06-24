'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import ListGroup from '@/components/widget/list_group'
import ListItem from '@/components/widget/list_item'
import Scaffold from '@/components/widget/scaffold'
import { getCustomRoles, getSettings, updateSettings } from '@/lib/actions'
import { MAX_ROLE_LIMIT } from '@/lib/constants'
import { roles } from '@/lib/roles'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const router = useRouter()
  const {
    isPending,
    error,
    data: customRoles,
  } = useQuery({
    queryKey: ['custom_roles'],
    queryFn: () => {
      return getCustomRoles(webApp?.initData || '').then((result) => result)
    },
    enabled: initialized,
  })

  const { data: settings } = useQuery({
    queryKey: ['query_settings'],
    queryFn: () => {
      return getSettings(webApp?.initData || '').then((result) => result)
    },
    enabled: initialized,
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
      <p>{'Tailor the chatbot to better meet your needs.'}</p>
      <div className={clsx({ 'animate-pulse': isPending })}>
        <ListGroup>
          {!customRoles?.length && <ListItem title={'No custom roles yet'} />}
          {customRoles?.map((role) => {
            return (
              <ListItem
                key={role.id}
                title={role.name}
                selectionMode="check"
                selected={settings?.current_chat_mode == role.id}
                onClick={(e) => handleSelection(e, role.id)}
              />
            )
          })}
          {customRoles?.length || 0 >= MAX_ROLE_LIMIT ? (
            <ListItem title={'Reach the limit of custom roles'} />
          ) : (
            <ListItem title={'Add a custom role'} />
          )}
        </ListGroup>
        <ListGroup>
          {Object.values(roles).map((role) => {
            return (
              <ListItem
                key={role.id}
                title={role.name}
                selectionMode="check"
                selected={settings?.current_chat_mode == role.id}
                onClick={(e) => handleSelection(e, role.id)}
              />
            )
          })}
        </ListGroup>
      </div>
    </Scaffold>
  )
}
