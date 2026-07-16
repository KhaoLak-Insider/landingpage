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
  const uploadFile = await convertJpegToWebp(file);
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

async function convertJpegToWebp(file: File): Promise<File> {
  if (!new Set(["image/jpeg", "image/jpg"]).has(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86),
    );

    if (!blob || blob.type !== "image/webp") return file;

    const baseName = file.name.replace(/\.(jpe?g)$/i, "") || "image";
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
