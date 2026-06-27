import { Camera } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { ALLOWED_IMAGE_ACCEPT, ALLOWED_IMAGE_ERROR, isAllowedImageType } from "../utils/imageTypes";

export default function Profile() {
  const { user, uploadProfileImage } = useAuth();
  const [imageMode, setImageMode] = useState("file");
  const [preview, setPreview] = useState(user?.profile_image_url || "");
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(user?.profile_image_url || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!isAllowedImageType(selected)) {
      setError(ALLOWED_IMAGE_ERROR);
      return;
    }
    setError("");
    setMessage("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleImageUrlChange = (event) => {
    const url = event.target.value;
    setImageUrl(url);
    setPreview(url.trim());
    setError("");
    setMessage("");
  };

  const handleImageModeChange = (mode) => {
    setImageMode(mode);
    setFile(null);
    setImageUrl(user?.profile_image_url || "");
    setPreview(user?.profile_image_url || "");
    setError("");
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();

    const hasFile = imageMode === "file" && file;
    const hasUrl = imageMode === "url" && imageUrl.trim();

    if (!hasFile && !hasUrl) {
      setError(imageMode === "file" ? "Please choose an image file" : "Please enter an image URL");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (imageMode === "file") {
        await uploadProfileImage({ file });
      } else {
        await uploadProfileImage({ imageUrl: imageUrl.trim() });
      }
      setMessage("Profile picture updated");
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to upload profile picture");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6 flex items-center gap-4">
        {preview ? (
          <img className="h-24 w-24 rounded-full object-cover" src={preview} alt={user.username} />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Camera size={28} />
          </div>
        )}
        <div>
          <p className="font-bold">{user.username}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="mt-1 text-sm font-semibold capitalize text-tomato">{user.role}</p>
        </div>
      </div>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        {message && <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Profile picture</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input checked={imageMode === "file"} name="profileImageMode" onChange={() => handleImageModeChange("file")} type="radio" value="file" />
              Upload file
            </label>
            <label className="flex items-center gap-2">
              <input checked={imageMode === "url"} name="profileImageMode" onChange={() => handleImageModeChange("url")} type="radio" value="url" />
              Image URL
            </label>
          </div>
          {imageMode === "file" ? (
            <input className="form-input" accept={ALLOWED_IMAGE_ACCEPT} onChange={handleFileChange} type="file" />
          ) : (
            <input
              className="form-input"
              onChange={handleImageUrlChange}
              placeholder="https://example.com/profile.jpg"
              type="url"
              value={imageUrl}
            />
          )}
        </fieldset>

        <button className="btn-primary" disabled={saving} type="submit">{saving ? "Saving..." : "Update profile picture"}</button>
      </form>
    </section>
  );
}
