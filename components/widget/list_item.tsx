import { Url } from 'next/dist/shared/lib/router/router'
import Link from 'next/link'

export const SELECTION_MODE_CHECK = 'check'
export const SELECTION_MODE_NONE = 'none'

export default function ListItem({
  title,
  subtitle,
  //   badge,
  to,
  //   selectionMode = SELECTION_MODE_NONE,
  //   selected = false,
  //   leading,
  //   trailing,
  //   className,
  onClick,
  //   hideNavIndicator = false,
}: {
  title: string
  subtitle?: string
  to?: Url
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  //   const checkIcon = selected ? (
  //     <i
  //       className="bi bi-check-lg"
  //       style={{ color: `var(--tg-theme-button-color)` }}
  //     ></i>
  //   ) : null

  //   const leadingWrap = leading ? <div className="me-3">{leading}</div> : null
  const body = (
    <>
      {/* {leadingWrap} */}
      <div className="me-auto">
        <div>{title}</div>
        {subtitle && <small className="text-body-secondary">{subtitle}</small>}
      </div>
      {/* {trailing && (
        <span style={{ color: `var(--tg-theme-link-color)` }}>{trailing}</span>
      )} */}
      {/* {badge && <span className="badge bg-primary rounded-pill">{badge}</span>}
      {selectionMode == SELECTION_MODE_CHECK && checkIcon} */}
      {/* {to && !to.startsWith('http') && !hideNavIndicator && (
        <i className="bi bi-chevron-right text-secondary"></i>
      )} */}
    </>
  )

  let listItemClasses = 'block py-2 px-4'
  //   if (className) {
  //     listItemClasses += ` ${className}`
  //   }

  return to ? (
    <Link href={to} className={listItemClasses}>
      {body}
    </Link>
  ) : (
    <div className={listItemClasses} onClick={onClick}>
      {body}
    </div>
  )
}
