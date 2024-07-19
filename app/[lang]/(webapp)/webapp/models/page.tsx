'use client'

import { useTelegram } from '@/components/webapp/telegram-provider'
import LoadingSkeleton from '@/components/widget/LoadingSkeleton'
import ListGroup from '@/components/widget/ListGroup'
import ListItem from '@/components/widget/ListItem'
import Scaffold from '@/components/widget/scaffold'
import { getSettings, updateSettings } from '@/lib/actions'
import { ModelType, models } from '@/lib/models'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import { themeProps } from '@/lib/telegram/constants'

export default function Page() {
  const { initialized, webApp } = useTelegram()
  const router = useRouter()
  const { isPending, error, data } = useQuery({
    queryKey: ['query_settings', initialized],
    queryFn: () => {
      const app = webApp
      if (!app) return null
      return getSettings(app.initData).then((result) => result)
    },
  })

  const searchParams = useSearchParams()
  const startedForResult = !!searchParams.get('start_for_result')

  async function handleSelection(e: React.MouseEvent, option: ModelType) {
    e.stopPropagation()
    e.preventDefault()

    await updateSettings({ current_model: option }, webApp?.initData || '')

    if (startedForResult) {
      webApp?.close()
    } else {
      router.back()
    }
  }

  return (
    <Scaffold title="AI Model" root={startedForResult}>
      <div className={clsx({ 'animate-pulse': isPending })}>
        <ListGroup>
          {Object.values(models).map((model) => {
            return (
              <ListItem
                key={model.id}
                title={model.title}
                subtitle={model.caption}
                selectionMode="circle"
                selected={data?.current_model == model.id}
                onClick={(e) => handleSelection(e, model.id as ModelType)}
              />
            )
          })}
        </ListGroup>
        {/* <h2 className="font-bold my-4" style={{ color: themeProps.text_color }}>
          Token Consumption
        </h2> */}
        {/* <table
          className="w-full border-collapse border border-slate-500"
          style={{ color: themeProps.text_color }}
        >
          <thead>
            <tr>
              <th className="border border-slate-600 px-4 py-2">Model</th>
              <th className="border border-slate-600 px-4 py-2">Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-700 px-4 py-2">GPT 3.5</td>
              <td className="border border-slate-700 px-4 py-2">1x</td>
            </tr>
            <tr>
              <td className="border border-slate-700 px-4 py-2">GPT 4</td>
              <td className="border border-slate-700 px-4 py-2">10x</td>
            </tr>
            <tr>
              <td className="border border-slate-700 px-4 py-2">Gemini</td>
              <td className="border border-slate-700 px-4 py-2">3x</td>
            </tr>
          </tbody>
        </table> */}
      </div>
    </Scaffold>
  )
}
