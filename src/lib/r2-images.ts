import { supabase } from "@/src/lib/supabase";

async function authorizationHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Für den Bild-Upload ist eine Anmeldung erforderlich.");
  }

  return { Authorization: `Bearer ${session.access_token}` };
}

async function responseError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return data?.error || `Anfrage fehlgeschlagen (${response.status}).`;
}

export async function uploadR2Image(
  file: File,
  category: string,
  slug: string,
  kind: "hero" | "gallery",
): Promise<string> {
  const uploadFile = await optimizeImageForUpload(file);
  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("category", category);
  formData.append("slug", slug);
  formData.append("kind", kind);

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: await authorizationHeaders(),
    body: formData,
  });

  if (!response.ok) throw new Error(await responseError(response));

  const data = (await response.json()) as { url?: string };
  if (!data.url) throw new Error("Der Upload lieferte keine Bild-URL.");
  return data.url;
}

async function uploadScopedImage(
  file: File,
  fields: Record<string, string>,
): Promise<string> {
  const uploadFile = await optimizeImageForUpload(file);
  const formData = new FormData();
  formData.append("file", uploadFile);
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: await authorizationHeaders(),
    body: formData,
  });

  if (!response.ok) throw new Error(await responseError(response));
  const data = (await response.json()) as { url?: string };
  if (!data.url) throw new Error("Der Upload lieferte keine Bild-URL.");
  return data.url;
}

export function uploadHotelImage(
  file: File,
  hotelSlug: string,
  kind: "hero" | "gallery",
): Promise<string> {
  return uploadScopedImage(file, { scope: "hotel", hotelSlug, kind });
}

export function uploadRoomImage(
  file: File,
  hotelSlug: string,
  roomSlug: string,
  kind: "cover" | "gallery",
): Promise<string> {
  return uploadScopedImage(file, {
    scope: "room",
    hotelSlug,
    roomSlug,
    kind,
  });
}

export function uploadHotelVideo(file: File, hotelSlug: string): Promise<string> {
  return uploadScopedImage(file, { scope: "hotel", hotelSlug, kind: "video" });
}

const MAX_IMAGE_EDGE = 2400;
const WEBP_QUALITY = 0.82;

async function optimizeImageForUpload(file: File): Promise<File> {
  const convertibleTypes = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);
  if (!convertibleTypes.has(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );

    if (!blob || blob.type !== "image/webp") return file;

    // Keep an already smaller source file; optimization must never increase storage.
    if (blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/i, "") || "image";
    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}

export async function deleteR2Image(url: string): Promise<void> {
  const response = await fetch("/api/upload", {
    method: "DELETE",
    headers: {
      ...(await authorizationHeaders()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) throw new Error(await responseError(response));
}
