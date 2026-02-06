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

  if (loading) return <p className="loading">Loading product…</p>;
  if (error && mode === "edit")
    return (
      <div className="error-block">
        <p className="error">Error: {error}</p>
        <button type="button" onClick={loadProduct}>
          Reload
        </button>
      </div>
    );

  return (
    <div className="product-form">
      <h2>{mode === "create" ? "Add product" : "Edit product"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Name <span className="required">*</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
        </div>
        <div className="form-row">
          <label>
            Category <span className="required">*</span>
            <input
              type="text"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
            {errors.category && <span className="field-error">{errors.category}</span>}
          </label>
        </div>
        <div className="form-row">
          <label>
            Price <span className="required">*</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price || ""}
              onChange={(e) => handleChange("price", e.target.value === "" ? 0 : Number(e.target.value))}
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </label>
        </div>
        <div className="form-row">
          <label>
            Quantity in stock
            <input
              type="number"
              min="0"
              step="1"
              value={form.quantityInStock}
              onChange={(e) => handleChange("quantityInStock", Number(e.target.value) || 0)}
            />
            {errors.quantityInStock && (
              <span className="field-error">{errors.quantityInStock}</span>
            )}
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="button" onClick={onBack} disabled={submitLoading}>
            Back
          </button>
          <button type="submit" disabled={submitLoading}>
            {submitLoading ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
