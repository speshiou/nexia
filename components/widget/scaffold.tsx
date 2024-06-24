'use client'

import { ReactNode, useEffect } from 'react'
import { useTelegram } from '../webapp/telegram-provider'
import { useRouter } from 'next/navigation'

export default function Scaffold({
  children,
  title,
  root = false,
  mainButtonOptions,
}: {
  children: ReactNode
  title: string
  root?: boolean
  mainButtonOptions?: {
    show: boolean
    processing: boolean
    text: string
    onClick: () => void
  }
}) {
  const router = useRouter()
  const { initialized, webApp } = useTelegram()

  useEffect(() => {
    if (root) {
      webApp?.BackButton?.hide()
    } else {
      webApp?.BackButton?.show()
      webApp?.BackButton?.onClick(back)
    }

    return () => {
      webApp?.BackButton?.offClick(back)
    }
  }, [initialized, root])

  useEffect(() => {
    if (mainButtonOptions) {
      webApp?.MainButton?.setParams({
        text: mainButtonOptions.text,
      })
      if (mainButtonOptions.show) {
        webApp?.MainButton?.show()
      } else {
        webApp?.MainButton?.hide()
      }
      if (!mainButtonOptions.processing) {
        webApp?.MainButton?.enable()
      } else {
        webApp?.MainButton?.showProgress()
        webApp?.MainButton?.disable()
      }
      webApp?.MainButton?.onClick(mainButtonOptions.onClick)
    } else {
      webApp?.MainButton?.hide()
    }

    return () => {
      if (mainButtonOptions) {
        webApp?.MainButton?.offClick(mainButtonOptions.onClick)
      }
      webApp?.MainButton?.hideProgress()
      webApp?.BackButton?.offClick(back)
    }
  }, [initialized, mainButtonOptions])

  function back() {
    router.back()
  }

  return (
    <div className="container py-4 px-3 mx-auto user-select-none">
      {title && <h1 className="mb-3 font-bold">{title}</h1>}
      {children}
    </div>
  )
}
