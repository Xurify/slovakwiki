import { AwsClient } from "aws4fetch";

export interface R2Bucket {
  aws: AwsClient;
  objectUrl: (key: string) => string;
}

export function r2FromEnv(env: NodeJS.ProcessEnv = process.env): R2Bucket | undefined {
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucket = env.R2_BUCKET;
  if (!(accountId && accessKeyId && secretAccessKey && bucket)) return undefined;

  const jurisdiction = (env.R2_JURISDICTION ?? "").trim().toLowerCase();
  const host = jurisdiction
    ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
    : `${accountId}.r2.cloudflarestorage.com`;

  return {
    aws: new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" }),
    objectUrl: (key) => `https://${host}/${bucket}/${key}`,
  };
}
