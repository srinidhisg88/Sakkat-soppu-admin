import { useEffect, useMemo, useRef, useState } from 'react';
import { getPublicCategories, type Category } from '@/api/categoriesApi'

export type ProductFormValues = {
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  description: string;
  isOrganic?: boolean;
  images: File[]; // at least one image required for imageUrl
  videos?: File[];
  unitType?: 'none' | 'grams' | 'pieces';
  g?: number;
  pieces?: number;
};

type Props = {
  initial?: Partial<ProductFormValues>;
  onSubmit: (formData: FormData) => void;
  submitting?: boolean;
  // existing media for edit mode (URLs)
  initialExistingImages?: string[];
  initialExistingVideos?: string[];
};

export default function ProductForm({ initial, onSubmit, submitting, initialExistingImages = [], initialExistingVideos = [] }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name || '',
    categoryId: (initial as any)?.categoryId || '',
    price: initial?.price || 0,
    stock: initial?.stock || 0,
    description: initial?.description || '',
    isOrganic: initial?.isOrganic || false,
    images: [],
    videos: [],
  unitType: initial && (initial as any).g ? 'grams' : initial && (initial as any).pieces ? 'pieces' : 'none',
  g: (initial as any)?.g || 0,
  pieces: (initial as any)?.pieces || 0,
  });

  // Existing media (URLs) and removal tracking (for edit mode)
  const [existingImages, setExistingImages] = useState<string[]>(initialExistingImages)
  const [existingVideos, setExistingVideos] = useState<string[]>(initialExistingVideos)
  const [removedImages, setRemovedImages] = useState<Set<string>>(new Set())
  const [removedVideos, setRemovedVideos] = useState<Set<string>>(new Set())

  // File input refs for triggering via buttons
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchCats = async () => {
      try {
        const res = await getPublicCategories()
        if (mounted) setCategories(res.data)
      } catch {
        if (mounted) setCategories([])
      } finally {
        if (mounted) setCatLoading(false)
      }
    }
    fetchCats()
    const onUpdated = () => fetchCats()
    window.addEventListener('categories:updated', onUpdated as EventListener)
    return () => {
      mounted = false
      window.removeEventListener('categories:updated', onUpdated as EventListener)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Require at least one media when creating (image or video). No native required on hidden inputs.
    if (!initial) {
      const hasNewImages = values.images.length > 0
      const hasNewVideos = (values.videos?.length || 0) > 0
      if (!hasNewImages && !hasNewVideos) {
        alert('Please add at least one image or video.')
        return
      }
    }

    const formData = new FormData();
    formData.append('name', values.name);
  formData.append('categoryId', values.categoryId);
    formData.append('price', values.price.toString());
    formData.append('stock', values.stock.toString());
    formData.append('description', values.description);
    formData.append('isOrganic', values.isOrganic ? 'true' : 'false');

    // Unit fields: prefer only one of g or pieces; treat 0/empty as unset
    const g = Number(values.g || 0);
    const pcs = Number(values.pieces || 0);
    if (values.unitType === 'grams' && g > 0) {
      formData.append('g', String(g));
    } else if (values.unitType === 'pieces' && pcs > 0) {
      formData.append('pieces', String(pcs));
    }

  // images (append all under `images` for multer array)
  values.images.forEach((file) => formData.append('images', file));

  // videos
  values.videos?.forEach((file) => formData.append('videos', file));

    // For edit: include removal arrays for existing media
    if (initial) {
      removedImages.forEach((url) => formData.append('removeImages', url))
      removedVideos.forEach((url) => formData.append('removeVideos', url))
      // Include imagesOrder when reordering existing images; send only the ones kept
      const keptExisting = existingImages.filter((u) => !removedImages.has(u))
      if (keptExisting.length > 0) {
        keptExisting.forEach((u) => formData.append('imagesOrder', u))
      }
      // Include videosOrder when reordering existing videos; send only kept
      const keptExistingVideos = existingVideos.filter((u) => !removedVideos.has(u))
      if (keptExistingVideos.length > 0) {
        keptExistingVideos.forEach((u) => formData.append('videosOrder', u))
      }
    }

    onSubmit(formData);
  };

  // Drag and drop helpers
  const onDropImages = (files: FileList | File[]) => {
    const picked = Array.from(files || [])
      .filter((f) => f.type.startsWith('image/'))
    if (picked.length === 0) return
    setValues((v) => ({ ...v, images: [...v.images, ...picked] }))
  }
  const onDropVideos = (files: FileList | File[]) => {
    const picked = Array.from(files || [])
      .filter((f) => f.type.startsWith('video/'))
    if (picked.length === 0) return
    setValues((v) => ({ ...v, videos: [...(v.videos || []), ...picked] }))
  }

  const activeExistingImages = useMemo(() => existingImages.map((url) => ({ url, removed: removedImages.has(url) })), [existingImages, removedImages])
  const activeExistingVideos = useMemo(() => existingVideos.map((url) => ({ url, removed: removedVideos.has(url) })), [existingVideos, removedVideos])

  // Simple drag-and-drop reordering for existing images
  const dragIndexRef = useRef<number | null>(null)
  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragIndexRef.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOverReorder = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const onDropReorder = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === idx) return
    setExistingImages((arr) => {
      const next = [...arr]
      const [moved] = next.splice(from, 1)
      next.splice(idx, 0, moved)
      return next
    })
    dragIndexRef.current = null
  }

  // Reordering for existing videos
  const videoDragIndexRef = useRef<number | null>(null)
  const onVideoDragStart = (idx: number) => (e: React.DragEvent) => {
    videoDragIndexRef.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }
  const onVideoDragOverReorder = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const onVideoDropReorder = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const from = videoDragIndexRef.current
    if (from === null || from === idx) return
    setExistingVideos((arr) => {
      const next = [...arr]
      const [moved] = next.splice(from, 1)
      next.splice(idx, 0, moved)
      return next
    })
    videoDragIndexRef.current = null
  }

  return (
  <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">Product details</h4>
          <p className="text-sm text-gray-500">Fill in basic info and media</p>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
        />
      </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
            value={values.categoryId}
            onChange={(e) => setValues({ ...values, categoryId: e.target.value })}
            required
          >
            <option value="" disabled>{catLoading ? 'Loading…' : 'Select a category'}</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {!catLoading && categories.length === 0 && (
            <div className="text-xs text-red-600 mt-1">No categories found. Create categories first.</div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
            value={values.price}
            onChange={(e) =>
              setValues({ ...values, price: parseFloat(e.target.value) })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Stock</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
            value={values.stock}
            onChange={(e) =>
              setValues({ ...values, stock: parseInt(e.target.value || '0') })
            }
            required
          />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <input
            id="isOrganic"
            type="checkbox"
            checked={values.isOrganic}
            onChange={(e) =>
              setValues({ ...values, isOrganic: e.target.checked })
            }
          />
          <label htmlFor="isOrganic">Organic</label>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          rows={3}
          value={values.description}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
          required
        />
      </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm mb-1">Unit type</label>
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-1">
              <input type="radio" name="unitType" checked={values.unitType === 'none'} onChange={() => setValues({ ...values, unitType: 'none' })} />
              None
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="radio" name="unitType" checked={values.unitType === 'grams'} onChange={() => setValues({ ...values, unitType: 'grams' })} />
              Grams (g)
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="radio" name="unitType" checked={values.unitType === 'pieces'} onChange={() => setValues({ ...values, unitType: 'pieces' })} />
              Pieces (pcs)
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {values.unitType === 'grams' && (
            <div>
              <label className="block text-sm mb-1">Grams (g)</label>
              <input type="number" min={0} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
                value={values.g || 0}
                onChange={(e) => setValues({ ...values, g: Number(e.target.value || 0) })}
              />
            </div>
          )}
          {values.unitType === 'pieces' && (
            <div>
              <label className="block text-sm mb-1">Pieces</label>
              <input type="number" min={0} className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
                value={values.pieces || 0}
                onChange={(e) => setValues({ ...values, pieces: Number(e.target.value || 0) })}
              />
            </div>
          )}
        </div>
      </div>

  {/* Media section */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Images</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                onClick={() => imageInputRef.current?.click()}
              >
                Add images
              </button>
              <button
                type="button"
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                onClick={() => setValues((v) => ({ ...v, images: [] }))}
                disabled={values.images.length === 0}
              >
                Clear new
              </button>
            </div>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onDropImages(e.target.files || [])}
          />
          <div
            className="border-2 border-dashed rounded-md p-6 text-sm text-gray-600 hover:bg-gray-50"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropImages(e.dataTransfer.files) }}
          >
            Drag & drop images here, or use “Add images”
          </div>
          {/* Existing image previews */}
          {existingImages.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">Existing</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {activeExistingImages.map(({ url, removed }, idx) => (
                  <div
                    key={url}
                    className={`relative group border rounded overflow-hidden ${removed ? 'opacity-50 grayscale' : ''}`}
                    draggable
                    onDragStart={onDragStart(idx)}
                    onDragOver={onDragOverReorder(idx)}
                    onDrop={onDropReorder(idx)}
                    title="Drag to reorder"
                  >
                    <img src={url} alt="img" className="w-full h-28 object-cover" />
                    <div className="absolute top-1 left-1 bg-white/80 text-[10px] px-1 rounded shadow cursor-move">≡</div>
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-2 py-0.5 rounded shadow"
                      onClick={() => {
                        setRemovedImages((s) => {
                          const next = new Set(s)
                          if (next.has(url)) next.delete(url); else next.add(url)
                          return next
                        })
                      }}
                    >
                      {removed ? 'Undo' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* New image previews */}
          {values.images.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">To upload</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {values.images.map((file, idx) => {
                  const src = URL.createObjectURL(file)
                  return (
                    <div key={idx} className="relative group border rounded overflow-hidden">
                      <img src={src} alt={file.name} className="w-full h-28 object-cover" onLoad={() => URL.revokeObjectURL(src)} />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-2 py-0.5 rounded shadow"
                        onClick={() => setValues((v) => ({ ...v, images: v.images.filter((_, i) => i !== idx) }))}
                      >
                        Remove
                      </button>
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
              <button
                type="button"
                className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                onClick={() => videoInputRef.current?.click()}
              >
                Add videos
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                onClick={() => setValues((v) => ({ ...v, videos: [] }))}
                disabled={!values.videos || values.videos.length === 0}
              >
                Clear new
              </button>
            </div>
          </div>
          <input
            ref={videoInputRef}
            type="file"
            multiple
            accept="video/*"
            className="hidden"
            onChange={(e) => onDropVideos(e.target.files || [])}
          />
          <div
            className="border-2 border-dashed rounded-md p-6 text-sm text-gray-600 hover:bg-gray-50"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropVideos(e.dataTransfer.files) }}
          >
            Drag & drop videos here, or use “Add videos”
          </div>
          {/* Existing video previews */}
          {existingVideos.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">Existing</div>
              <div className="grid grid-cols-2 gap-3">
                {activeExistingVideos.map(({ url, removed }, idx) => (
                  <div
                    key={url}
                    className={`relative group border rounded overflow-hidden ${removed ? 'opacity-50' : ''}`}
                    draggable
                    onDragStart={onVideoDragStart(idx)}
                    onDragOver={onVideoDragOverReorder(idx)}
                    onDrop={onVideoDropReorder(idx)}
                    title="Drag to reorder"
                  >
                    <video src={url} className="w-full h-28 object-cover" controls preload="metadata" />
                    <div className="absolute top-1 left-1 bg-white/80 text-[10px] px-1 rounded shadow cursor-move">≡</div>
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-2 py-0.5 rounded shadow"
                      onClick={() => {
                        setRemovedVideos((s) => {
                          const next = new Set(s)
                          if (next.has(url)) next.delete(url); else next.add(url)
                          return next
                        })
                      }}
                    >
                      {removed ? 'Undo' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* New video previews */}
          {values.videos && values.videos.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-1">To upload</div>
              <div className="grid grid-cols-2 gap-3">
                {values.videos.map((file, idx) => {
                  const src = URL.createObjectURL(file)
                  return (
                    <div key={idx} className="relative group border rounded overflow-hidden">
                      <video src={src} className="w-full h-28 object-cover" controls preload="metadata" onLoadedData={() => URL.revokeObjectURL(src)} />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-2 py-0.5 rounded shadow"
                        onClick={() => setValues((v) => ({ ...v, videos: (v.videos || []).filter((_, i) => i !== idx) }))}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

  <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-60 hover:bg-green-700 active:bg-green-800 transition-colors"
          disabled={submitting}
        >
          Save
        </button>
      </div>
    </form>
  );
}