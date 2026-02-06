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

  const inputClass =
    "block w-full border border-slate-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";

  if (loading) return <p className="text-slate-600 py-4">Loading product…</p>;
  if (error && mode === "edit")
    return (
      <div className="flex flex-wrap items-center gap-3 my-4">
        <p className="text-red-700 bg-red-50 px-3 py-2 rounded-md text-sm">Error: {error}</p>
        <button
          type="button"
          onClick={loadProduct}
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Reload
        </button>
      </div>
    );

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        {mode === "create" ? "Add product" : "Edit product"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium text-slate-700">
            Name <span className="text-red-500">*</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputClass}
            />
            {errors.name && (
              <span className="block text-red-600 text-sm mt-1">{errors.name}</span>
            )}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium text-slate-700">
            Category <span className="text-red-500">*</span>
            <input
              type="text"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={inputClass}
            />
            {errors.category && (
              <span className="block text-red-600 text-sm mt-1">{errors.category}</span>
            )}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium text-slate-700">
            Price <span className="text-red-500">*</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price || ""}
              onChange={(e) =>
                handleChange("price", e.target.value === "" ? 0 : Number(e.target.value))
              }
              className={inputClass}
            />
            {errors.price && (
              <span className="block text-red-600 text-sm mt-1">{errors.price}</span>
            )}
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-medium text-slate-700">
            Quantity in stock
            <input
              type="number"
              min="0"
              step="1"
              value={form.quantityInStock}
              onChange={(e) =>
                handleChange("quantityInStock", Number(e.target.value) || 0)
              }
              className={inputClass}
            />
            {errors.quantityInStock && (
              <span className="block text-red-600 text-sm mt-1">
                {errors.quantityInStock}
              </span>
            )}
          </label>
        </div>
        {error && (
          <p className="text-red-700 bg-red-50 px-3 py-2 rounded-md text-sm mb-4">{error}</p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={submitLoading}
            className="border border-slate-300 rounded-md px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {submitLoading ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
