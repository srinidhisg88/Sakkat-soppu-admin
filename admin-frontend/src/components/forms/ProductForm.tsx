import { useEffect, useState } from 'react';
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
};

export default function ProductForm({ initial, onSubmit, submitting }: Props) {
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
    return () => { mounted = false }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Require an image only when creating a new product (no initial)
    if (!initial && values.images.length === 0) {
      alert('At least one image is required');
      return;
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

    onSubmit(formData);
  };

  return (
  <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              setValues({
                ...values,
                images: Array.from(e.target.files || []),
              })
            }
            required={!initial}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Videos</label>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) =>
              setValues({
                ...values,
                videos: Array.from(e.target.files || []),
              })
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60 hover:bg-green-700 active:bg-green-800 transition-colors"
          disabled={submitting}
        >
          Save
        </button>
      </div>
    </form>
  );
}