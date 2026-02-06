import { useCallback, useEffect, useState } from "react";
import {
  createProduct,
  fetchProduct,
  updateProduct,
  type CreateProductBody,
} from "./api";

interface Props {
  storeId: string;
  productId: string | null;
  mode: "create" | "edit";
  onDone: () => void;
  onBack: () => void;
}

const emptyForm: CreateProductBody = {
  storeId: "",
  name: "",
  category: "",
  price: 0,
  quantityInStock: 0,
};

function validate(form: CreateProductBody): Record<string, string> {
  const err: Record<string, string> = {};
  if (!form.name.trim()) err.name = "Name is required";
  if (!form.category.trim()) err.category = "Category is required";
  if (form.price <= 0 || Number.isNaN(form.price)) err.price = "Price must be positive";
  if (form.quantityInStock < 0 || !Number.isInteger(form.quantityInStock)) {
    err.quantityInStock = "Quantity must be a non-negative integer";
  }
  return err;
}

export default function ProductForm({ storeId, productId, mode, onDone, onBack }: Props) {
  const [form, setForm] = useState<CreateProductBody>({ ...emptyForm, storeId });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(mode === "edit");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const p = await fetchProduct(productId);
      setForm({
        storeId: p.storeId,
        name: p.name,
        category: p.category,
        price: p.price,
        quantityInStock: p.quantityInStock,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (mode === "edit" && productId) loadProduct();
    else if (mode === "create") setForm((f) => ({ ...f, storeId }));
  }, [mode, productId, storeId, loadProduct]);

  const handleChange = (field: keyof CreateProductBody, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(form);
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    setSubmitLoading(true);
    setError(null);
    try {
      if (mode === "edit" && productId) {
        await updateProduct(productId, {
          name: form.name,
          category: form.category,
          price: form.price,
          quantityInStock: form.quantityInStock,
        });
      } else {
        await createProduct({ ...form, storeId });
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-slate-500 py-6 text-sm animate-pulse">Loading product…</p>
    );
  }
  if (error && mode === "edit")
    return (
      <div className="flex flex-wrap items-center gap-3 my-4 p-4 card rounded-xl">
        <p className="text-red-700 bg-red-50/90 px-3 py-2 rounded-lg text-sm border border-red-100">
          Error: {error}
        </p>
        <button type="button" onClick={loadProduct} className="btn-secondary text-sm py-1.5 px-3">
          Reload
        </button>
      </div>
    );

  return (
    <div className="max-w-md">
      <div className="card p-6 sm:p-8 rounded-xl shadow-card-lg">
        <h2 className="font-display text-2xl font-semibold text-slate-900 tracking-tight mb-6">
          {mode === "create" ? "Add product" : "Edit product"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="input-premium mt-0"
            />
            {errors.name && (
              <span className="block text-red-600 text-sm mt-1.5">{errors.name}</span>
            )}
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="input-premium mt-0"
            />
            {errors.category && (
              <span className="block text-red-600 text-sm mt-1.5">{errors.category}</span>
            )}
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price || ""}
              onChange={(e) =>
                handleChange("price", e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="input-premium mt-0"
            />
            {errors.price && (
              <span className="block text-red-600 text-sm mt-1.5">{errors.price}</span>
            )}
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantity in stock
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.quantityInStock}
              onChange={(e) =>
                handleChange("quantityInStock", Number(e.target.value) || 0)
              }
              className="input-premium mt-0"
            />
            {errors.quantityInStock && (
              <span className="block text-red-600 text-sm mt-1.5">
                {errors.quantityInStock}
              </span>
            )}
          </div>
          {error && (
            <p className="text-red-700 bg-red-50/90 px-3 py-2 rounded-lg text-sm mb-5 border border-red-100">
              {error}
            </p>
          )}
          <div className="flex gap-3 mt-8 pt-2">
            <button
              type="button"
              onClick={onBack}
              disabled={submitLoading}
              className="btn-secondary disabled:opacity-50 disabled:active:scale-100"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="btn-primary disabled:opacity-50 disabled:active:scale-100"
            >
              {submitLoading ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
