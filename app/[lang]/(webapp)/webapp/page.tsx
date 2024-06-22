'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import ListGroup from '@/components/widget/list_group'
import ListItem from '@/components/widget/list_item'
import Scaffold from '@/components/widget/scaffold'
import { usePathname } from 'next/navigation'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const pathname = usePathname()

  return (
    <Scaffold title="Settings" root={true}>
      Telegram is ready {`${initialized}`}
      <ListGroup>
        <ListItem title="test" />
        <ListItem title="test2" />
      </ListGroup>
      <ListGroup>
        <ListItem title="test" />
        <ListItem title="test2" />
      </ListGroup>
      <ListGroup>
        <ListItem title="UI Language" />
        <ListItem to={`${pathname}/bots`} title="Bots created by Nexia" />
        <ListItem to="https://t.me/nexia_support" title="Feedback" />
      </ListGroup>
    </Scaffold>
  )
}
