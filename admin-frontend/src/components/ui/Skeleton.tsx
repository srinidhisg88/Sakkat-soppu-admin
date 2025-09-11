import clsx from 'classnames'

type Props = {
  className?: string
  variant?: 'block' | 'text'
  width?: number | string
  height?: number | string
}

export default function Skeleton({ className, variant = 'block', width, height }: Props) {
  const style: React.CSSProperties = {}
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height
  const base = 'skeleton rounded'
  const size = variant === 'text' ? 'h-3 w-40' : 'h-5 w-full'
  return <div className={clsx(base, size, className)} style={style} />
}
