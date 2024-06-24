'use client'

import RoleForm from '@/components/RoleForm'
import { useTelegram } from '@/components/webapp/telegram-provider'
import Scaffold from '@/components/widget/scaffold'
import { upsertCustomRole } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function Page() {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const { initialized } = useTelegram()
  const [processing, setProcessing] = useState(false)

  const submit = async () => {
    const form = formRef.current
    if (!form) return

    setProcessing(true)
    const formData = new FormData(form)
    const result = await upsertCustomRole(formData)
    if (result) {
      router.back()
    } else {
      setProcessing(false)
    }
  }

  return (
    <Scaffold
      title="Create Role"
      mainButtonOptions={{
        text: 'Create',
        show: true,
        processing: !initialized || processing,
        onClick: submit,
      }}
    >
      <RoleForm ref={formRef} />
    </Scaffold>
  )
}
