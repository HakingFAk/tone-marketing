import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env.js";

function normalizeKey(relKey: string) {
  const key = relKey.replace(/^\/+/, "");
  if (!key || key.includes("..") || !/^[a-zA-Z0-9._/-]+$/.test(key)) {
    throw new Error("Chave de armazenamento inválida.");
  }
  return key;
}

function appendHashSuffix(relKey: string) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function getClient() {
  if (!ENV.s3Bucket || !ENV.s3Region || !ENV.s3AccessKeyId || !ENV.s3SecretAccessKey) {
    throw new Error("Armazenamento não configurado. Defina S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID e S3_SECRET_ACCESS_KEY.");
  }

  return new S3Client({
    region: ENV.s3Region,
    endpoint: ENV.s3Endpoint || undefined,
    forcePathStyle: Boolean(ENV.s3Endpoint),
    credentials: { accessKeyId: ENV.s3AccessKeyId, secretAccessKey: ENV.s3SecretAccessKey },
  });
}

function publicUrl(key: string) {
  const baseUrl = (ENV.s3PublicBaseUrl || `${ENV.appBaseUrl}/media`).replace(/\/+$/, "");
  return `${baseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream") {
  const key = appendHashSuffix(normalizeKey(relKey));
  const client = getClient();
  await client.send(new PutObjectCommand({ Bucket: ENV.s3Bucket, Key: key, Body: data, ContentType: contentType }));
  return { key, url: publicUrl(key) };
}

export async function storageCreateUploadUrl(relKey: string) {
  const key = appendHashSuffix(normalizeKey(relKey));
  const client = getClient();
  const uploadUrl = await getSignedUrl(client, new PutObjectCommand({ Bucket: ENV.s3Bucket, Key: key }), { expiresIn: 300 });
  return { key, url: publicUrl(key), uploadUrl };
}

export async function storageGet(relKey: string) {
  const key = normalizeKey(relKey);
  return { key, url: publicUrl(key) };
}

export async function storageGetSignedUrl(relKey: string) {
  const key = normalizeKey(relKey);
  return getSignedUrl(getClient(), new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }), { expiresIn: 300 });
}
