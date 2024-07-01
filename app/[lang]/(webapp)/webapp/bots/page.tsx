import Notice from '@/components/notice'
import ListGroup from '@/components/widget/ListGroup'
import ListItem from '@/components/widget/ListItem'
import Scaffold from '@/components/widget/scaffold'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export default async function Page() {
  return (
    <Scaffold title="Bots created by Nexia">
      <ListGroup>
        <ListItem to="https://t.me/gpt_tg_chatbot" title="@gpt_tg_chatbot" />
        <ListItem
          to="https://t.me/gemini_vision_bot"
          title="@gemini_vision_bot"
        />
      </ListGroup>
      <Notice
        className="mt-8"
        leading={<InformationCircleIcon className="w-6 h-6" />}
      >
        {'All bots use the same account balance.'}
      </Notice>
    </Scaffold>
  )
}
