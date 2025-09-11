import { useMemo, useState } from 'react'

export type MediaItem = { type: 'image' | 'video'; src: string }

export default function MediaSlider({ items, startIndex = 0 }: { items: MediaItem[]; startIndex?: number }) {
  const media = useMemo(() => items.filter((m) => !!m?.src), [items])
  const [idx, setIdx] = useState(Math.min(Math.max(startIndex, 0), Math.max(media.length - 1, 0)))
  const has = media.length > 0
  const cur = media[idx]

  const prev = () => setIdx((i) => (i - 1 + media.length) % media.length)
  const next = () => setIdx((i) => (i + 1) % media.length)

  if (!has) return <div className="text-sm text-gray-500">No media</div>

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-black/5 rounded overflow-hidden">
        {cur.type === 'image' ? (
          <img src={cur.src} alt="Product media" className="w-full h-full object-contain" />
        ) : (
          <video src={cur.src} controls className="w-full h-full object-contain" />
        )}
        {media.length > 1 && (
          <>
            <button aria-label="Previous" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow">
              <span className="sr-only">Previous</span>
              ‹
            </button>
            <button aria-label="Next" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow">
              <span className="sr-only">Next</span>
              ›
            </button>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`border rounded overflow-hidden w-16 h-16 shrink-0 ${i === idx ? 'ring-2 ring-green-600' : ''}`}
              aria-label={`Go to media ${i + 1}`}
            >
              {m.type === 'image' ? (
                <img src={m.src} alt="thumb" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-black/70 text-white text-xs flex items-center justify-center">Video</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
