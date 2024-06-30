import { themeProps } from '@/lib/telegram/constants'
import clsx from 'clsx'

export default function ListGroup({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <>
      {title && (
        <div
          className="uppercase py-2 px-4 mt-2"
          style={{ color: themeProps.section_header_text_color }}
        >
          <small>{title}</small>
        </div>
      )}
      <div
        className={clsx(
          `divide-y divide-tg-divider rounded-md ring-1 ring-black ring-opacity-5`,
          {
            'mt-4': !title,
          },
        )}
        style={{ backgroundColor: themeProps.bg_color }}
      >
        {children}
      </div>
    </>
  )
}
