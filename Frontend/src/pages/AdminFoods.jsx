import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../services/api";
import { ALLOWED_IMAGE_ACCEPT, ALLOWED_IMAGE_ERROR, isAllowedImageType } from "../utils/imageTypes";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  description: "",
  availability: true,
};

export default function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageMode, setImageMode] = useState("file");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadFoods = () => api.get("/foods").then(({ data }) => setFoods(data));

  useEffect(() => {
    loadFoods();
  }, []);

  const resetImageFields = () => {
    setImageFile(null);
    setImageUrl("");
    setPreview("");
    setImageMode("file");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const hasFile = imageMode === "file" && imageFile;
    const hasUrl = imageMode === "url" && imageUrl.trim();

    if (!editingId && !hasFile && !hasUrl) {
      setError(imageMode === "file" ? "Please choose an image file" : "Please enter an image URL");
      return;
    }

    try {
      if (imageMode === "url") {
        const payload = {
          name: form.name,
          category: form.category,
          price: Number(form.price),
          description: form.description || null,
          availability: form.availability,
          image_url: imageUrl.trim(),
        };
        if (editingId) {
          await api.put(`/foods/${editingId}`, payload);
        } else {
          await api.post("/foods", payload);
        }
      } else {
        const payload = new FormData();
        payload.append("name", form.name);
        payload.append("category", form.category);
        payload.append("price", form.price);
        payload.append("description", form.description);
        payload.append("availability", form.availability);
        if (imageFile) {
          payload.append("image", imageFile);
        }
        if (editingId) {
          await api.put(`/foods/${editingId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await api.post("/foods", payload, { headers: { "Content-Type": "multipart/form-data" } });
        }
      }
      setForm(emptyForm);
      resetImageFields();
      setEditingId(null);
      loadFoods();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to save food item");
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isAllowedImageType(file)) {
      setError(ALLOWED_IMAGE_ERROR);
      return;
    }
    setError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageUrlChange = (event) => {
    const url = event.target.value;
    setImageUrl(url);
    setPreview(url.trim());
    setError("");
  };

  const handleImageModeChange = (mode) => {
    setImageMode(mode);
    setImageFile(null);
    setImageUrl("");
    setPreview(editingId ? foods.find((food) => food.id === editingId)?.image_url || "" : "");
    setError("");
  };

  const editFood = (food) => {
    setEditingId(food.id);
    setForm({
      name: food.name,
      category: food.category,
      price: food.price,
      description: food.description || "",
      availability: food.availability,
    });
    setImageMode("file");
    setImageFile(null);
    setImageUrl(food.image_url || "");
    setPreview(food.image_url || "");
  };

  const deleteFood = async (id) => {
    await api.delete(`/foods/${id}`);
    loadFoods();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
        <h1 className="text-xl font-bold">{editingId ? "Edit food item" : "Add food item"}</h1>
        <div className="mt-4 space-y-3">
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <input className="form-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="form-input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="form-input" min="0" placeholder="Price" step="0.01" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">Food image</legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input checked={imageMode === "file"} name="imageMode" onChange={() => handleImageModeChange("file")} type="radio" value="file" />
                Upload file
              </label>
              <label className="flex items-center gap-2">
                <input checked={imageMode === "url"} name="imageMode" onChange={() => handleImageModeChange("url")} type="radio" value="url" />
                Image URL
              </label>
            </div>
            {imageMode === "file" ? (
              <input
                className="form-input"
                accept={ALLOWED_IMAGE_ACCEPT}
                onChange={handleImageChange}
                type="file"
                required={!editingId}
              />
            ) : (
              <input
                className="form-input"
                onChange={handleImageUrlChange}
                placeholder="https://example.com/food.jpg"
                type="url"
                value={imageUrl}
                required={!editingId}
              />
            )}
          </fieldset>

          {preview && <img className="h-36 w-full rounded-md object-cover" src={preview} alt="Food preview" />}
          <textarea className="form-input min-h-24" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input checked={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.checked })} type="checkbox" />
            Available
          </label>
          <button className="btn-primary w-full" type="submit">
            <Plus size={16} />
            {editingId ? "Update food" : "Add food"}
          </button>
          {editingId && (
            <button
              className="btn-secondary w-full"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                resetImageFields();
              }}
              type="button"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">Food</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {foods.map((food) => (
                <tr key={food.id}>
                  <td className="px-4 py-3 font-semibold">
                    <div className="flex items-center gap-3">
                      <img className="h-12 w-12 rounded-md object-cover" src={food.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80"} alt={food.name} />
                      {food.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">{food.category}</td>
                  <td className="px-4 py-3">${Number(food.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{food.availability ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary px-3" onClick={() => editFood(food)} type="button" aria-label="Edit food"><Edit size={16} /></button>
                      <button className="btn-danger px-3" onClick={() => deleteFood(food.id)} type="button" aria-label="Delete food"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
