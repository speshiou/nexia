'use client'

import { useTelegram } from './telegram-provider'
import Header from './header'
import ImageCreator from './image_creator'
import { CreateImageTaskProvider } from '../create-image-task'
import { EventHandler, ViewportChangedProps } from '@/types/telegram'

// utilize s singleton to prevent the handler from being repeatedly registered
const handleMainButtonClick = () => {
  ;(document.querySelector('[type=submit]') as HTMLButtonElement).click()
}

const onViewportChanged: EventHandler<ViewportChangedProps> = ({
  isStateStable,
}) => {
  console.log(`onViewportChanged ${isStateStable}`)
  if (isStateStable) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export default function WebApp() {
  const { webApp } = useTelegram()

  // the component may be instantiated multiple times
  webApp?.MainButton?.offClick(handleMainButtonClick)
  webApp?.MainButton?.onClick(handleMainButtonClick)
  webApp?.offEvent('viewportChanged', onViewportChanged)
  webApp?.onEvent('viewportChanged', onViewportChanged)

  return (
    <>
      <Header />
      <CreateImageTaskProvider>
        <ImageCreator />
      </CreateImageTaskProvider>
    </>
  )
}
