import { useState } from 'react';

export type ProductFormValues = {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  isOrganic?: boolean;
  images: File[]; // at least one image required for imageUrl
  videos?: File[];
};

type Props = {
  initial?: Partial<ProductFormValues>;
  onSubmit: (formData: FormData) => void;
  submitting?: boolean;
};

export default function ProductForm({ initial, onSubmit, submitting }: Props) {
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name || '',
    category: initial?.category || '',
    price: initial?.price || 0,
    stock: initial?.stock || 0,
    description: initial?.description || '',
    isOrganic: initial?.isOrganic || false,
    images: [],
    videos: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Require an image only when creating a new product (no initial)
    if (!initial && values.images.length === 0) {
      alert('At least one image is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('category', values.category);
    formData.append('price', values.price.toString());
    formData.append('stock', values.stock.toString());
    formData.append('description', values.description);
    formData.append('isOrganic', values.isOrganic ? 'true' : 'false');

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
          <input
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
            value={values.category}
            onChange={(e) => setValues({ ...values, category: e.target.value })}
            required
          />
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