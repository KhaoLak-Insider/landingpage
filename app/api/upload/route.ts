import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function getR2Config() {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, "");

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error("R2 ist auf dem Server nicht vollständig konfiguriert.");
  }

  return {
    bucket,
    publicUrl,
    client: new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

async function verifyEditor(request: NextRequest): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "").trim();

  if (!supabaseUrl || !supabaseAnonKey || !accessToken) return false;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) return false;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return false;

  return ["admin", "editor"].includes(
    String(profile?.role || "").trim().toLowerCase(),
  );
}

function pathSegment(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function fileExtension(file: File): string {
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };

  return byType[file.type] || "img";
}

function getOwnedKey(urlValue: string, publicUrl: string): string | null {
  try {
    const url = new URL(urlValue);
    const base = new URL(publicUrl);
    const basePath = base.pathname.replace(/\/$/, "");
    const ownedPrefixes = ["spots", "hotels"].map((folder) =>
      `${basePath}/${folder}/`.replace(/\/+/g, "/"),
    );

    if (
      url.origin !== base.origin ||
      !ownedPrefixes.some((prefix) => url.pathname.startsWith(prefix))
    ) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(basePath.length + 1));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyEditor(request))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const scope = String(formData.get("scope") || "spot");
    const category = String(formData.get("category") || "");
    const slug = String(formData.get("slug") || "");
    const hotelSlug = String(formData.get("hotelSlug") || "");
    const roomSlug = String(formData.get("roomSlug") || "");
    const imageKind = String(formData.get("kind") || "gallery");

    const validSpot =
      scope === "spot" &&
      Boolean(category.trim()) &&
      Boolean(slug.trim()) &&
      ["hero", "gallery"].includes(imageKind);
    const validHotel =
      scope === "hotel" &&
      Boolean(hotelSlug.trim()) &&
      ["hero", "gallery", "video"].includes(imageKind);
    const validRoom =
      scope === "room" &&
      Boolean(hotelSlug.trim()) &&
      Boolean(roomSlug.trim()) &&
      ["cover", "gallery"].includes(imageKind);

    if (!(file instanceof File) || (!validSpot && !validHotel && !validRoom)) {
      return NextResponse.json(
        { error: "Datei, Kategorie, Slug und Bildtyp werden benötigt." },
        { status: 400 },
      );
    }

    const isVideo = imageKind === "video";
    if (!(isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES).has(file.type)) {
      return NextResponse.json(
        { error: "Nicht unterstütztes Bildformat." },
        { status: 415 },
      );
    }

    const maxFileSize = isVideo ? 250 * 1024 * 1024 : MAX_FILE_SIZE;
    if (file.size <= 0 || file.size > maxFileSize) {
      return NextResponse.json(
        { error: "Das Bild darf höchstens 15 MB groß sein." },
        { status: 413 },
      );
    }

    const { client, bucket, publicUrl } = getR2Config();
    const shortId = crypto.randomUUID().split("-")[0];
    const extension = fileExtension(file);
    let key: string;

    if (scope === "hotel") {
      const hotelPath = pathSegment(hotelSlug, "temp-hotel");
      key = `hotels/${hotelPath}/${imageKind}/${hotelPath}-${imageKind}-${shortId}.${extension}`;
    } else if (scope === "room") {
      const hotelPath = pathSegment(hotelSlug, "temp-hotel");
      const roomPath = pathSegment(roomSlug, "temp-room");
      key = `hotels/${hotelPath}/rooms/${roomPath}/${imageKind}/${roomPath}-${imageKind}-${shortId}.${extension}`;
    } else {
      const categoryPath = pathSegment(category, "ohne-kategorie");
      const spotPath = pathSegment(slug, "temp");
      key = `spots/${categoryPath}/${spotPath}/${spotPath}-${imageKind}-${shortId}.${extension}`;
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return NextResponse.json({ key, url: `${publicUrl}/${key}` });
  } catch (error) {
    console.error("R2-Upload fehlgeschlagen:", error);
    return NextResponse.json({ error: "Upload fehlgeschlagen." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyEditor(request))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const body = (await request.json()) as { url?: unknown };
    const url = typeof body.url === "string" ? body.url : "";

    if (!url) {
      return NextResponse.json({ error: "Bild-URL fehlt." }, { status: 400 });
    }

    const { client, bucket, publicUrl } = getR2Config();
    const key = getOwnedKey(url, publicUrl);

    if (!key) {
      return NextResponse.json({ deleted: false, external: true });
    }

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return NextResponse.json({ deleted: true, key });
  } catch (error) {
    console.error("R2-Löschen fehlgeschlagen:", error);
    return NextResponse.json({ error: "Bild konnte nicht gelöscht werden." }, { status: 500 });
  }
}
