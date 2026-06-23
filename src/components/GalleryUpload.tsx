"use client";

import { useState } from "react";

export default function GalleryUpload({ slug, onUpload }: { slug: string, onUpload: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !slug) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("folder", slug);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) newUrls.push(data.url);
    }

    onUpload(newUrls);
    setUploading(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold mb-2 text-slate-700">Galerie-Bilder hochladen:</label>
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={handleFilesChange} 
        disabled={uploading || !slug}
        className="w-full p-2 border rounded-xl file:bg-teal-50 file:border-0 file:text-teal-600 file:font-bold file:px-4 file:py-2 file:rounded-lg cursor-pointer"
      />
      {uploading && <p className="text-xs text-teal-600 mt-2">Lädt Galerie-Bilder hoch...</p>}
    </div>
  );
}