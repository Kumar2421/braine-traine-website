import './LoadingSpinner.css'

export function LoadingSpinner({ size = 'medium', className = '' }) {
  return (
    <div className={`loadingSpinner loadingSpinner--${size} ${className}`} role="status" aria-label="Loading">
      <div className="loadingSpinner__circle" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function Skeleton({ width, height, className = '' }) {
  const style = {}
  if (width) style.width = width
  if (height) style.height = height

  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

export function TableSkeleton({ rows = 3, columns = 5 }) {
  return (
    <div className="tableSkeleton">
      <div className="tableSkeleton__head">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1.5rem" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="tableSkeleton__row">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} height="1.25rem" />
          ))}
        </div>
      ))}
    </div>
  )
}

