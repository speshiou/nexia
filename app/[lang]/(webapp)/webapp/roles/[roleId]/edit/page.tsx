'use client'

import RoleForm from '@/components/RoleForm'
import { useTelegram } from '@/components/webapp/telegram-provider'
import Scaffold from '@/components/widget/scaffold'
import { deleteCustomRole, upsertCustomRole } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function Page({
  params,
}: Readonly<{
  params: {
    roleId: string
  }
}>) {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const { initialized, webApp } = useTelegram()
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

  const handleDelete = () => {
    webApp?.showPopup(
      {
        title: 'Are you sure to delete?',
        message: 'This action cannot be undone.',
        buttons: [
          {
            id: 'delete',
            type: 'destructive',
            text: 'Delete',
          },
          {
            type: 'cancel',
          },
        ],
      },
      async (id) => {
        if (id == 'delete') {
          await deleteCustomRole(params.roleId, webApp?.initData)
          router.back()
        }
      },
    )
  }

  return (
    <Scaffold
      title="Edit Role"
      mainButtonOptions={{
        text: 'Save',
        show: true,
        processing: !initialized || processing,
        onClick: submit,
      }}
    >
      <RoleForm ref={formRef} />
      <div className="text-center p-4">
        <button className="text-red-600" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </Scaffold>
  )
}
