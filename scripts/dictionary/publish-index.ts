import { createHash } from "node:crypto";

import { r2FromEnv } from "../lib/r2";

export const DICTIONARY_INDEX_CACHE_CONTROL = "public, max-age=31536000, immutable";

export function dictionaryIndexFileName(json: string): string {
  const hash = createHash("sha256").update(json).digest("hex").slice(0, 12);
  return `dictionary-browse.${hash}.json`;
}

export function servedIndexProblem(
  response: Pick<Response, "headers" | "ok" | "status">,
  siteOrigin: string,
): string | undefined {
  if (!response.ok) return `HTTP ${response.status}`;

  const allowOrigin = response.headers.get("access-control-allow-origin");
  if (allowOrigin !== "*" && allowOrigin !== siteOrigin) {
    return `no Access-Control-Allow-Origin for ${siteOrigin} (add a CORS rule to the bucket)`;
  }

  const encoding = response.headers.get("content-encoding") ?? "";
  if (!/\b(br|gzip|zstd)\b/.test(encoding)) {
    return "served uncompressed (serve the bucket through a Cloudflare custom domain)";
  }

  return undefined;
}

/** Public R2 URL for the index, or `undefined` to keep serving the site's own copy. */
export async function publishDictionaryIndex(options: {
  env?: NodeJS.ProcessEnv;
  fileName: string;
  json: string;
  siteOrigin: string;
  warn: (message: string) => void;
}): Promise<string | undefined> {
  const env = options.env ?? process.env;
  const base = env.PUBLIC_DATA_BASE_URL?.replace(/\/$/, "");
  if (!base) return undefined;

  const key = `data/${options.fileName}`;
  const publicUrl = `${base}/${key}`;
  const r2 = r2FromEnv(env);

  try {
    if (r2) {
      const head = await r2.aws.fetch(r2.objectUrl(key), { method: "HEAD" });
      if (!head.ok) {
        const put = await r2.aws.fetch(r2.objectUrl(key), {
          method: "PUT",
          headers: {
            "Cache-Control": DICTIONARY_INDEX_CACHE_CONTROL,
            "Content-Type": "application/json",
          },
          body: options.json,
        });
        if (!put.ok) {
          options.warn(
            `Dictionary index upload failed (R2 ${put.status}); serving it from the site.`,
          );
          return undefined;
        }
      }
    }

    // The query string bypasses any edge-cached 404 from before the upload.
    const served = await fetch(`${publicUrl}?verify=${Date.now()}`, {
      headers: { "Accept-Encoding": "br, gzip", Origin: options.siteOrigin },
    });
    await served.body?.cancel();

    const problem = servedIndexProblem(served, options.siteOrigin);
    if (problem) {
      const hint = r2 ? "" : " (R2_* credentials are not set, so it was not uploaded)";
      options.warn(
        `Dictionary index not used from ${publicUrl}: ${problem}${hint}; serving it from the site.`,
      );
      return undefined;
    }

    return publicUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    options.warn(
      `Dictionary index R2 publish failed (${message}); serving it from the site.`,
    );
    return undefined;
  }
}
