'use client'

import RoleForm from '@/components/RoleForm'
import { useTelegram } from '@/components/webapp/telegram-provider'
import Scaffold from '@/components/widget/scaffold'
import { useState } from 'react'

export default function Page() {
  const { initialized } = useTelegram()
  const [processing, setProcessing] = useState(false)
  const submit = () => {
    setProcessing(true)
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
      <RoleForm />
    </Scaffold>
  )
}
