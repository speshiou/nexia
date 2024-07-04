'use client'

import { getCustomRole, upsertCustomRole } from '@/lib/actions'
import { useTelegram } from './webapp/telegram-provider'
import { FormHTMLAttributes, forwardRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { themeProps } from '@/lib/telegram/constants'

const RoleForm = forwardRef<
  HTMLFormElement,
  FormHTMLAttributes<HTMLFormElement> & { initialRoleId?: string }
>(function RoleForm(props, ref) {
  const { initialized, webApp } = useTelegram()

  const { isPending, error, data } = useQuery({
    queryKey: ['get_role', initialized],
    queryFn: async () => {
      return await getCustomRole(props.initialRoleId!, webApp?.initData || '')
    },
    enabled: initialized && !!props.initialRoleId,
  })

  return (
    <form ref={ref} {...props} action={upsertCustomRole}>
      <input type="hidden" name="init_data" value={webApp?.initData} />
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
        <div className="col-span-full">
          <label
            htmlFor="name"
            className="block text-sm font-medium leading-6 "
            style={{ color: themeProps.text_color }}
          >
            Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="name"
              id="name"
              className="w-full px-4 rounded-md py-2 border-0 ring-1 ring-tg-secondary ring-inset bg-transparent placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tg-accent sm:text-sm sm:leading-6"
              style={{ color: themeProps.text_color }}
              placeholder="Name of the role"
              defaultValue={data?.name}
            />
          </div>
        </div>

        <div className="col-span-full">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium leading-6"
            style={{ color: themeProps.text_color }}
          >
            Instructions
          </label>
          <div className="mt-2">
            <textarea
              id="prompt"
              name="prompt"
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 bg-transparent shadow-sm ring-1 ring-inset ring-tg-secondary placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-tg-accent sm:text-sm sm:leading-6 p-4"
              style={{ color: themeProps.text_color }}
              defaultValue={data?.prompt}
              placeholder="Write some instructions on how the chatbot should respond to your requests."
            />
          </div>
          <p className="mt-3 text-xs">
            <a
              style={{ color: themeProps.link_color }}
              href={'https://github.com/f/awesome-chatgpt-prompts#prompts'}
              target="blank"
            >
              ({'See examples'})
            </a>
          </p>
        </div>
      </div>
    </form>
  )
})

export { RoleForm as default }
