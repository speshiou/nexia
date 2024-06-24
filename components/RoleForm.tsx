'use client'

import { upsertCustomRole } from '@/lib/actions'
import { useTelegram } from './webapp/telegram-provider'

export default function RoleForm() {
  const { initialized, webApp } = useTelegram()
  return (
    <form action={upsertCustomRole}>
      <input type="hidden" name="init_data" value={webApp?.initData} />
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
        <div className="col-span-full">
          <label
            htmlFor="name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="name"
              id="name"
              className="w-full px-4 rounded-md py-2 border-0 ring-1 ring-inset bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Name of the role"
            />
          </div>
        </div>

        <div className="col-span-full">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Instructions
          </label>
          <div className="mt-2">
            <textarea
              id="prompt"
              name="prompt"
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 bg-transparent text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-4"
              defaultValue={''}
              placeholder="Write some instructions on how the chatbot should respond to your requests."
            />
          </div>
          <p className="mt-3 text-xs">
            <a
              style={{ color: `var(--tg-theme-link-color)` }}
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
}
