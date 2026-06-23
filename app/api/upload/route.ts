import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string; // z.B. der Slug

    if (!file || !folder) return NextResponse.json({ error: 'Daten unvollständig' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const Key = `spots/${folder}/${fileName}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: Key,
      Body: buffer,
      ContentType: file.type,
    }));

    return NextResponse.json({ url: `${process.env.R2_PUBLIC_URL}/${Key}` });
  } catch (error) {
    return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 });
  }
}