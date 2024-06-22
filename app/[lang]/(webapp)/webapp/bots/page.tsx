import ListGroup from '@/components/widget/list_group'
import ListItem from '@/components/widget/list_item'
import Scaffold from '@/components/widget/scaffold'

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
    </Scaffold>
  )
}
