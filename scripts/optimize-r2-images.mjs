import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const MAX_IMAGE_EDGE = 2400;
const WEBP_QUALITY = 82;
const apply = process.argv.includes("--apply");
const prefixArg = process.argv.find((argument) => argument.startsWith("--prefix="));
const prefix = prefixArg?.slice("--prefix=".length) || "hotels/sentido-khao-lak/";

const required = [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];
for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error(`${name} fehlt.`);
}

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT.trim(),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },
});
const bucket = process.env.R2_BUCKET_NAME.trim();
const imagePattern = /\.(?:jpe?g|png|webp|avif)$/i;

async function listKeys() {
  const objects = [];
  let continuationToken;
  do {
    const page = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    objects.push(...(page.Contents || []).filter((item) => item.Key && imagePattern.test(item.Key)));
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);
  return objects;
}

async function bodyToBuffer(body) {
  return Buffer.from(await body.transformToByteArray());
}

const objects = await listKeys();
let originalBytes = 0;
let optimizedBytes = 0;
let replaceable = 0;
let skipped = 0;

for (const [index, object] of objects.entries()) {
  const key = object.Key;
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const original = await bodyToBuffer(response.Body);
  originalBytes += original.length;

  try {
    const optimized = await sharp(original, { failOn: "warning" })
      .rotate()
      .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 5 })
      .toBuffer();

    if (optimized.length >= original.length) {
      optimizedBytes += original.length;
      skipped += 1;
      continue;
    }

    optimizedBytes += optimized.length;
    replaceable += 1;
    if (apply) {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: optimized,
        ContentType: "image/webp",
        CacheControl: response.CacheControl || "public, max-age=31536000, immutable",
      }));
    }
  } catch (error) {
    optimizedBytes += original.length;
    skipped += 1;
    console.warn(`Uebersprungen: ${key} (${error instanceof Error ? error.message : error})`);
  }

  if ((index + 1) % 20 === 0 || index + 1 === objects.length) {
    console.log(`${index + 1}/${objects.length} verarbeitet`);
  }
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  prefix,
  images: objects.length,
  replaceable,
  skipped,
  beforeMb: mb(originalBytes),
  afterMb: mb(optimizedBytes),
  savedMb: mb(originalBytes - optimizedBytes),
}, null, 2));
