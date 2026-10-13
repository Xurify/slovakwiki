import { AwsClient } from "aws4fetch";

export interface R2Bucket {
  /** Signed S3 client for the bucket's account. */
  aws: AwsClient;
  /** S3 API URL for an object key, e.g. `data/dictionary-browse.abc.json`. */
  objectUrl: (key: string) => string;
}

/**
 * R2 bucket from `R2_*` env (same variables as scripts/audio/upload.ts), or
 * `undefined` when any credential is missing.
 */
export function r2FromEnv(env: NodeJS.ProcessEnv = process.env): R2Bucket | undefined {
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucket = env.R2_BUCKET;
  if (!(accountId && accessKeyId && secretAccessKey && bucket)) return undefined;

  // Jurisdiction buckets (e.g. EU) need `.<jurisdiction>` in the host.
  const jurisdiction = (env.R2_JURISDICTION ?? "").trim().toLowerCase();
  const host = jurisdiction
    ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
    : `${accountId}.r2.cloudflarestorage.com`;

  return {
    aws: new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" }),
    objectUrl: (key) => `https://${host}/${bucket}/${key}`,
  };
}
