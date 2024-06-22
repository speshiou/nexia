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
          className="text-uppercase ms-3 me-3 mb-1"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          <small>{title}</small>
        </div>
      )}
      <div className="divide-y divide-gray-100 rounded-md ring-1 ring-black ring-opacity-5">
        {children}
      </div>
    </>
  )
}
