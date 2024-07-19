'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import ListGroup from '@/components/widget/ListGroup'
import ListItem from '@/components/widget/ListItem'
import Scaffold from '@/components/widget/scaffold'
import { getCustomRoles, getSettings, updateSettings } from '@/lib/actions'
import { MAX_ROLE_LIMIT } from '@/lib/constants'
import { roles } from '@/lib/roles'
import { themeProps } from '@/lib/telegram/constants'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const pathname = usePathname()
  const router = useRouter()
  const {
    isPending,
    error,
    data: customRoles,
  } = useQuery({
    queryKey: ['custom_roles'],
    queryFn: () => {
      return getCustomRoles(webApp?.initData || '')
    },
    enabled: initialized,
  })

  const { data: settings } = useQuery({
    queryKey: ['query_settings'],
    queryFn: () => getSettings(webApp?.initData || ''),
    enabled: initialized,
  })

  const searchParams = useSearchParams()

  const startedForResult = !!searchParams.get('start_for_result')

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
    <Scaffold title="Role" root={startedForResult}>
      <p style={{ color: themeProps.hint_color }}>
        {'Tailor the chatbot to better meet your needs.'}
      </p>
      <div className={clsx({ 'animate-pulse': isPending })}>
        <ListGroup title="Custom">
          {!customRoles?.length && <ListItem title={'No custom roles yet'} />}
          {customRoles?.map((role) => {
            const selected = settings?.current_chat_mode.id == role.id
            return (
              <ListItem
                key={role.id}
                title={role.name}
                selectionMode="circle"
                selected={selected}
                onClick={(e) => handleSelection(e, role.id)}
                trailing={
                  <Link
                    href={`${pathname}/${role.id}/edit`}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    {'Edit'}
                  </Link>
                }
              />
            )
          })}
          {(customRoles?.length || 0) >= MAX_ROLE_LIMIT ? (
            <ListItem title={'Reach the limit of custom roles'} />
          ) : (
            <ListItem
              to={`${pathname}/create`}
              title={
                <span style={{ color: themeProps.link_color }}>
                  Add a custom role
                </span>
              }
            />
          )}
        </ListGroup>
        <ListGroup title="System">
          {Object.values(roles).map((role) => {
            const selected = settings?.current_chat_mode.id == role.id
            return (
              <ListItem
                key={role.id}
                title={role.name}
                selectionMode="circle"
                selected={selected}
                onClick={(e) => handleSelection(e, role.id)}
              />
            )
          })}
        </ListGroup>
      </div>
    </Scaffold>
  )
}
