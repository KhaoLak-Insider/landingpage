"use client";

import { useState } from "react";

export default function ImageUpload({ slug, onUpload }: { slug: string, onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !slug) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", slug);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.url) {
      onUpload(data.url);
    }
    setUploading(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold mb-2 text-slate-700">Herobild hochladen:</label>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={uploading || !slug}
        className="w-full p-2 border rounded-xl file:bg-teal-50 file:border-0 file:text-teal-600 file:font-bold file:px-4 file:py-2 file:rounded-lg cursor-pointer"
      />
      {uploading && <p className="text-xs text-teal-600 mt-2">Lädt Bild hoch...</p>}
    </div>
  );
}