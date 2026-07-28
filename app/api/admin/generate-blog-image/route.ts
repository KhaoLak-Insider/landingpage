import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return false;
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
  } = await client.auth.getUser(token);
  if (!user) return false;
  const { data } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return ["admin", "editor"].includes(String(data?.role || "").toLowerCase());
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

function extractB64Json(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.b64_json === "string" && record.b64_json) return record.b64_json;
  const data = record.data;
  if (Array.isArray(data)) {
    for (const item of data) {
      const candidate = item as Record<string, unknown>;
      if (typeof candidate.b64_json === "string" && candidate.b64_json) {
        return candidate.b64_json;
      }
      if (typeof candidate.image_base64 === "string" && candidate.image_base64) {
        return candidate.image_base64;
      }
      const content = candidate.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          const contentPart = part as Record<string, unknown>;
          if (typeof contentPart.b64_json === "string" && contentPart.b64_json) {
            return contentPart.b64_json;
          }
          if (typeof contentPart.image_base64 === "string" && contentPart.image_base64) {
            return contentPart.image_base64;
          }
        }
      }
    }
  }
  const output = record.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const candidate = item as Record<string, unknown>;
      const content = candidate.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          const contentPart = part as Record<string, unknown>;
          if (typeof contentPart.b64_json === "string" && contentPart.b64_json) {
            return contentPart.b64_json;
          }
          if (typeof contentPart.image_base64 === "string" && contentPart.image_base64) {
            return contentPart.image_base64;
          }
        }
      }
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyEditor(request))) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY ist nicht konfiguriert." }, { status: 500 });
    }

    const body = (await request.json()) as {
      prompt?: unknown;
      blogSlug?: unknown;
      title?: unknown;
    };
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const blogSlug = typeof body.blogSlug === "string" ? body.blogSlug.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "Ein Bild-Prompt wird benötigt." }, { status: 400 });
    }

    const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        size: "1536x1024",
        quality: "high",
        output_format: "png",
      }),
      cache: "no-store",
    });

    const raw = (await imageResponse.json()) as
      | { error?: { message?: string }; data?: Array<{ b64_json?: string }> }
      | Record<string, unknown>;

    if (!imageResponse.ok) {
      const message =
        "error" in raw && raw.error?.message
          ? raw.error.message
          : "Die OpenAI-Bildgenerierung ist fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: imageResponse.status });
    }

    const b64 = extractB64Json(raw);
    if (!b64) {
      return NextResponse.json({ error: "OpenAI hat kein Bild zurückgegeben." }, { status: 502 });
    }

    const buffer = Buffer.from(b64, "base64");
    const { client, bucket, publicUrl } = getR2Config();
    const shortId = crypto.randomUUID().split("-")[0];
    const blogPath = pathSegment(blogSlug || title || "blog", "blog");
    const key = `blog/${blogPath}/${blogPath}-ai-${shortId}.png`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: "image/png",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return NextResponse.json({ url: `${publicUrl}/${key}`, key });
  } catch (error) {
    console.error("OpenAI-Bildgenerierung fehlgeschlagen:", error);
    return NextResponse.json({ error: "Bild konnte nicht generiert werden." }, { status: 500 });
  }
}
