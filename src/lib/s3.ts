/**
 * MinIO (S3-compatible) client helpers.
 *
 * Objects are never linked to directly from MinIO — the web app streams
 * them through /api/media/** so that private media stays access-controlled.
 */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export function bucketName(): string {
  return process.env.MINIO_BUCKET || "adiba-media";
}

export function getS3(): S3Client {
  if (!client) {
    const endpoint = process.env.MINIO_ENDPOINT;
    if (!endpoint) throw new Error("MINIO_ENDPOINT is not set — media storage unavailable.");
    const port = process.env.MINIO_PORT || "9000";
    client = new S3Client({
      endpoint: /^https?:\/\//.test(endpoint) ? `${endpoint}:${port}` : `http://${endpoint}:${port}`,
      region: "us-east-1", // MinIO ignores region but the SDK requires one
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || "",
        secretAccessKey: process.env.MINIO_SECRET_KEY || "",
      },
      forcePathStyle: true,
    });
  }
  return client;
}

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await getS3().send(
    new PutObjectCommand({
      Bucket: bucketName(),
      Key: key,
      Body: body,
      ContentLength: body.byteLength,
      ContentType: contentType,
    }),
  );
}

export type ObjectInfo = {
  stream: ReadableStream<Uint8Array> | null;
  contentType?: string;
  contentLength?: number;
  contentRange?: string;
  acceptRanges?: string;
  etag?: string;
  lastModified?: Date;
};

export async function getObject(key: string, rangeHeader?: string | null): Promise<ObjectInfo> {
  const res = await getS3().send(
    new GetObjectCommand({
      Bucket: bucketName(),
      Key: key,
      Range: rangeHeader || undefined,
    }),
  );
  return {
    stream: res.Body?.transformToWebStream() ?? null,
    contentType: res.ContentType,
    contentLength: res.ContentLength,
    contentRange: res.ContentRange,
    acceptRanges: res.AcceptRanges,
    etag: res.ETag,
    lastModified: res.LastModified,
  };
}

export async function deleteObject(key: string) {
  await getS3().send(new DeleteObjectCommand({ Bucket: bucketName(), Key: key }));
}

/** Build a unique storage key, e.g. "memories/<uuid>/photo.jpg". */
export function newKey(folder: string, filename: string): string {
  const safe = filename.replace(/[^\w.\-]+/g, "_").slice(-80) || "file";
  return `${folder}/${crypto.randomUUID()}/${safe}`;
}
