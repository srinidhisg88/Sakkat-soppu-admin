import React from 'react'

type Props = {
  page: number
  limit: number
  total?: number
  totalPages?: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, limit, total, totalPages, onPageChange }: Props) {
  const pages = totalPages ?? (total && limit ? Math.max(1, Math.ceil(total / limit)) : undefined)
  const canPrev = page > 1
  const canNext = pages ? page < pages : true

  const goPrev = () => canPrev && onPageChange(page - 1)
  const goNext = () => canNext && onPageChange(page + 1)

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {total != null ? (
          <span>
            Showing page {page}{pages ? ` of ${pages}` : ''} • {total} total
          </span>
        ) : (
          <span>Page {page}{pages ? ` of ${pages}` : ''}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          onClick={goPrev}
          disabled={!canPrev}
        >
          Prev
        </button>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          onClick={goNext}
          disabled={!canNext}
        >
          Next
        </button>
      </div>
    </div>
  )
}
