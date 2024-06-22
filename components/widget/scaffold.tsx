'use client'

import { ReactNode, useEffect } from 'react'
import { useTelegram } from '../webapp/telegram-provider'
import { useRouter } from 'next/navigation'

export default function Scaffold({
  children,
  title,
  root = false,
}: {
  children: ReactNode
  title: string
  root?: boolean
}) {
  const router = useRouter()
  const { initialized, webApp } = useTelegram()

  useEffect(() => {
    function back() {
      router.back()
    }

    if (root) {
      webApp?.BackButton?.hide()
    } else {
      webApp?.BackButton?.show()
    }

    webApp?.BackButton?.onClick(back)

    return () => {
      webApp?.BackButton?.offClick(back)
    }
  }, [])

  return (
    <div className="container py-4 px-3 mx-auto user-select-none">
      {title && <h1 className="mb-3 font-bold">{title}</h1>}
      {children}
    </div>
  )
}
