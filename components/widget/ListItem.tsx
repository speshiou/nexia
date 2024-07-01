import { themeProps } from '@/lib/telegram/constants'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { Url } from 'next/dist/shared/lib/router/router'
import Link from 'next/link'

export default function ListItem({
  title,
  subtitle,
  //   badge,
  to,
  selectionMode,
  selected = false,
  leading,
  trailing,
  //   className,
  onClick,
  hideNavIndicator = false,
}: {
  title: string | React.ReactNode
  subtitle?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode | string
  to?: Url
  selectionMode?: 'check' | 'none' | 'circle'
  selected?: boolean
  hideNavIndicator?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  const checkIcon = selected ? (
    <svg
      style={{ color: themeProps.accent_text_color }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 12.75 6 6 9-13.5"
      />
    </svg>
  ) : null
  const selectedIcon = (
    <CheckCircleIcon
      className="w-4 h-4"
      style={{ color: themeProps.accent_text_color }}
    />
  )
  const leadingIcon = (
    <div
      className="w-4 h-4 border rounded-xl"
      style={{ borderColor: themeProps.subtitle_text_color }}
    ></div>
  )
  if (selectionMode == 'circle') {
    leading = selected ? selectedIcon : leadingIcon
  }

  const leadingWrap = leading ? <div className="me-3">{leading}</div> : null
  const body = (
    <>
      {leadingWrap}
      <div className="flex-1">
        <div style={{ color: themeProps.text_color }}>{title}</div>
        {subtitle && (
          <small style={{ color: themeProps.subtitle_text_color }}>
            {subtitle}
          </small>
        )}
      </div>
      {trailing && (
        <>
          <span
            className="ms-2"
            style={{ color: themeProps.accent_text_color }}
          >
            {trailing}
          </span>
        </>
      )}
      {/* {badge && <span className="badge bg-primary rounded-pill">{badge}</span>} */}
      {selectionMode == 'check' && checkIcon}
      {to && !to.toString().startsWith('http') && !hideNavIndicator && (
        <ChevronRightIcon
          className="w-4 h-4"
          style={{ color: themeProps.subtitle_text_color }}
        />
      )}
    </>
  )

  let listItemClasses = 'flex py-2 px-4 items-center'
  //   if (className) {
  //     listItemClasses += ` ${className}`
  //   }

  return to ? (
    <Link href={to} className={listItemClasses}>
      {body}
    </Link>
  ) : (
    <div
      className={clsx(listItemClasses, { 'cursor-pointer': onClick })}
      onClick={onClick}
    >
      {body}
    </div>
  )
}
