import { promises as fs } from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { lookup as getMime } from "mime-types";

const driver = process.env.STORAGE_DRIVER ?? "local";

// Local
const localDir = process.env.LOCAL_STORAGE_DIR ?? "./.storage";
async function ensureLocalDir() {
  await fs.mkdir(localDir, { recursive: true });
}
export async function localPut(buffer: Buffer, key: string): Promise<string> {
  await ensureLocalDir();
  const file = path.join(localDir, key);
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, buffer);
  return `local:${key}`;
}
export function localGetUrl(key: string): string {
  return `/media/local/${key}`; // 実運用ではNginx経由や署名付きURLに置換
}

// S3
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION || "ap-northeast-1",
  credentials: process.env.S3_ACCESS_KEY
    ? { accessKeyId: process.env.S3_ACCESS_KEY!, secretAccessKey: process.env.S3_SECRET_KEY! }
    : undefined,
  forcePathStyle: !!process.env.S3_ENDPOINT // MinIO互換
});
const bucket = process.env.S3_BUCKET || "";

export async function s3Put(buffer: Buffer, key: string): Promise<string> {
  const mime = getMime(path.extname(key)) || "application/octet-stream";
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mime }));
  return `s3:${key}`;
}
// ここでは簡易に"直接キー"を返す。実運用は署名URL(GetObject)発行推奨
export function s3GetUrl(key: string): string {
  return `/media/s3/${key}`;
}

export async function putObject(buffer: Buffer, key: string): Promise<string> {
  if (driver === "s3") return s3Put(buffer, key);
  return localPut(buffer, key);
}

export function getObjectUrl(storedKey: string): string {
  if (storedKey.startsWith("s3:")) return s3GetUrl(storedKey.slice(3));
  if (storedKey.startsWith("local:")) return localGetUrl(storedKey.slice(6));
  return storedKey;
}
