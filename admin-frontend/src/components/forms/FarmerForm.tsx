import { useMemo, useRef, useState } from 'react'

export type FarmerFormValues = {
  name: string
  phone?: string
  address?: string
  farmName?: string
  farmDescription?: string
  images: File[]
  videos?: File[]
}

export default function FarmerForm({ initial, onSubmit, submitting, initialExistingImages = [], initialExistingVideos = [] }: {
  initial?: Partial<FarmerFormValues>
  onSubmit: (v: FormData) => void
  submitting?: boolean
  initialExistingImages?: string[]
  initialExistingVideos?: string[]
}) {
  const [values, setValues] = useState<FarmerFormValues>({
    name: initial?.name || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
    farmName: initial?.farmName || '',
    farmDescription: initial?.farmDescription || '',
    images: [],
    videos: [],
  })

  const [existingImages, setExistingImages] = useState<string[]>(initialExistingImages)
  const [existingVideos, setExistingVideos] = useState<string[]>(initialExistingVideos)
  const [removedImages, setRemovedImages] = useState<Set<string>>(new Set())
  const [removedVideos, setRemovedVideos] = useState<Set<string>>(new Set())

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const toFiles = (files: FileList | File[]): File[] => Array.from(files as any) as File[]

  const onDropImages = (files: FileList | File[]) => {
    const arr: File[] = toFiles(files).filter((f: File) => ['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type))
    if (arr.length) setValues((v: FarmerFormValues) => ({ ...v, images: [...(v.images || []), ...arr] }))
  }
  const onDropVideos = (files: FileList | File[]) => {
    const arr: File[] = toFiles(files).filter((f: File) => f.type.startsWith('video/'))
    if (arr.length) setValues((v: FarmerFormValues) => ({ ...v, videos: [...(v.videos || []), ...arr] }))
  }

  const activeExistingImages = useMemo(() => existingImages.map((url: string) => ({ url, removed: removedImages.has(url) })), [existingImages, removedImages])
  const activeExistingVideos = useMemo(() => existingVideos.map((url: string) => ({ url, removed: removedVideos.has(url) })), [existingVideos, removedVideos])

  // Reordering for existing images
  const dragIndexRef = useRef<number | null>(null)
  const onDragStart = (idx: number) => (e: React.DragEvent) => { dragIndexRef.current = idx; e.dataTransfer.effectAllowed = 'move' }
  const onDragOverReorder = (idx: number) => (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onDropReorder = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault(); const from = dragIndexRef.current; if (from === null || from === idx) return
  setExistingImages((arr: string[]) => { const next = [...arr]; const [m] = next.splice(from, 1); next.splice(idx, 0, m); return next })
    dragIndexRef.current = null
  }

  // Reordering for existing videos
  const videoDragIndexRef = useRef<number | null>(null)
  const onVideoDragStart = (idx: number) => (e: React.DragEvent) => { videoDragIndexRef.current = idx; e.dataTransfer.effectAllowed = 'move' }
  const onVideoDragOverReorder = (idx: number) => (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onVideoDropReorder = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault(); const from = videoDragIndexRef.current; if (from === null || from === idx) return
  setExistingVideos((arr: string[]) => { const next = [...arr]; const [m] = next.splice(from, 1); next.splice(idx, 0, m); return next })
    videoDragIndexRef.current = null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Require at least one media when creating
    const creating = initial == null
    if (creating) {
      const hasNew = (values.images?.length || 0) > 0 || (values.videos?.length || 0) > 0
  const keptExisting = existingImages.filter((u: string) => !removedImages.has(u)).length + existingVideos.filter((u: string) => !removedVideos.has(u)).length
      if (!hasNew && keptExisting === 0) {
        alert('Please add at least one image or video.')
        return
      }
    }

    const fd = new FormData()
    fd.append('name', values.name)
    if (values.phone) fd.append('phone', values.phone)
    if (values.address) fd.append('address', values.address)
    if (values.farmName) fd.append('farmName', values.farmName)
    if (values.farmDescription) fd.append('farmDescription', values.farmDescription)

  values.images?.forEach((f: File) => fd.append('images', f))
  values.videos?.forEach((f: File) => fd.append('videos', f))

    // Include removals and order (edit only)
    if (!creating) {
  removedImages.forEach((u: string) => fd.append('removeImages', u))
  removedVideos.forEach((u: string) => fd.append('removeVideos', u))
  const keptImgs = existingImages.filter((u: string) => !removedImages.has(u))
  keptImgs.forEach((u: string) => fd.append('imagesOrder', u))
  const keptVids = existingVideos.filter((u: string) => !removedVideos.has(u))
  keptVids.forEach((u: string) => fd.append('videosOrder', u))
    }

    onSubmit(fd)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">Farmer details</h4>
          <p className="text-sm text-gray-500">Basic info and media</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.phone || ''} onChange={(e) => setValues({ ...values, phone: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Address</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.address || ''} onChange={(e) => setValues({ ...values, address: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Farm Name</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.farmName || ''} onChange={(e) => setValues({ ...values, farmName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Farm Description</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.farmDescription || ''} onChange={(e) => setValues({ ...values, farmDescription: e.target.value })} />
        </div>
      </div>

      {/* Media section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Images</label>
            <div className="flex items-center gap-2">
              <button type="button" className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50" onClick={() => imageInputRef.current?.click()}>Add images</button>
              <button type="button" className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50" onClick={() => setValues((v) => ({ ...v, images: [] }))} disabled={values.images.length === 0}>Clear new</button>
            </div>
          </div>
          <input ref={imageInputRef} type="file" className="hidden" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={(e) => onDropImages(e.target.files || [])} />
          <div className="border-2 border-dashed rounded-md p-6 text-sm text-gray-600 hover:bg-gray-50" onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropImages(e.dataTransfer.files) }}>
            Drag & drop images here, or use “Add images”
          </div>
          {existingImages.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">Existing</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {activeExistingImages.map(({ url, removed }, idx) => (
                  <div key={url} className={`relative group border rounded overflow-hidden ${removed ? 'opacity-50 grayscale' : ''}`} draggable onDragStart={onDragStart(idx)} onDragOver={onDragOverReorder(idx)} onDrop={onDropReorder(idx)} title="Drag to reorder">
                    <img src={url} alt="img" className="w-full h-28 object-cover" />
                    <div className="absolute top-1 left-1 bg-white/80 text-[10px] px-1 rounded shadow cursor-move">≡</div>
                    <button type="button" className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-2 py-0.5 rounded shadow" onClick={() => setRemovedImages((s) => { const n = new Set(s); n.has(url) ? n.delete(url) : n.add(url); return n })}>{removed ? 'Undo' : 'Remove'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {values.images.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">To upload</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {values.images.map((file, idx) => {
                  const src = URL.createObjectURL(file)
                  return (
                    <div key={idx} className="relative group border rounded overflow-hidden">
                      <img src={src} alt={file.name} className="w-full h-28 object-cover" onLoad={() => URL.revokeObjectURL(src)} />
                      <button type="button" className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-2 py-0.5 rounded shadow" onClick={() => setValues((v) => ({ ...v, images: v.images.filter((_, i) => i !== idx) }))}>Remove</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Videos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Videos</label>
            <div className="flex items-center gap-2">
              <button type="button" className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50" onClick={() => videoInputRef.current?.click()}>Add videos</button>
              <button type="button" className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50" onClick={() => setValues((v) => ({ ...v, videos: [] }))} disabled={!values.videos || values.videos.length === 0}>Clear new</button>
            </div>
          </div>
          <input ref={videoInputRef} type="file" className="hidden" accept="video/*" multiple onChange={(e) => onDropVideos(e.target.files || [])} />
          <div className="border-2 border-dashed rounded-md p-6 text-sm text-gray-600 hover:bg-gray-50" onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropVideos(e.dataTransfer.files) }}>
            Drag & drop videos here, or use “Add videos”
          </div>
          {existingVideos.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">Existing</div>
              <div className="grid grid-cols-2 gap-3">
                {activeExistingVideos.map(({ url, removed }, idx) => (
                  <div key={url} className={`relative group border rounded overflow-hidden ${removed ? 'opacity-50' : ''}`} draggable onDragStart={onVideoDragStart(idx)} onDragOver={onVideoDragOverReorder(idx)} onDrop={onVideoDropReorder(idx)} title="Drag to reorder">
                    <video src={url} className="w-full h-28 object-cover" controls preload="metadata" />
                    <div className="absolute top-1 left-1 bg-white/80 text-[10px] px-1 rounded shadow cursor-move">≡</div>
                    <button type="button" className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-2 py-0.5 rounded shadow" onClick={() => setRemovedVideos((s) => { const n = new Set(s); n.has(url) ? n.delete(url) : n.add(url); return n })}>{removed ? 'Undo' : 'Remove'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {values.videos && values.videos.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">To upload</div>
              <div className="grid grid-cols-2 gap-3">
                {values.videos.map((file, idx) => {
                  const src = URL.createObjectURL(file)
                  return (
                    <div key={idx} className="relative group border rounded overflow-hidden">
                      <video src={src} className="w-full h-28 object-cover" controls preload="metadata" onLoadedData={() => URL.revokeObjectURL(src)} />
                      <button type="button" className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-2 py-0.5 rounded shadow" onClick={() => setValues((v) => ({ ...v, videos: (v.videos || []).filter((_, i) => i !== idx) }))}>Remove</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-60 hover:bg-green-700 active:bg-green-800 transition-colors" disabled={submitting}>Save</button>
      </div>
    </form>
  )
}
