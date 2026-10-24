import { existsSync } from "node:fs";
import type { ServerResponse } from "node:http";
import path from "node:path";

import type { AstroIntegration } from "astro";
import { loadEnv } from "vite";

import { toR2AudioKey } from "../lib/catalog/audio/core";
import { localAudioObjectKey } from "../lib/catalog/audio/dev-fallback";

function audioBaseUrl(): string | undefined {
  const fromProcess = process.env.PUBLIC_AUDIO_BASE_URL?.replace(/\/$/, "");
  if (fromProcess) return fromProcess;

  // Astro does not copy `.env` onto `process.env` before `astro:server:setup`.
  const loaded = loadEnv("development", process.cwd(), "PUBLIC_");
  const fromFile = loaded.PUBLIC_AUDIO_BASE_URL?.replace(/\/$/, "");
  return fromFile || undefined;
}

/**
 * Dev pages point at `/audio/{kind}/{hash}.mp3` (`static/audio/`, gitignored).
 * A clip stamped in the runtime index may only exist on R2. When the local
 * file is missing, stream it from `PUBLIC_AUDIO_BASE_URL` so Listen still plays.
 * A file on disk is left to Vite so a fresh local take wins over the CDN.
 */
export function audioDevFallback(): AstroIntegration {
  return {
    name: "audio-dev-fallback",
    hooks: {
      "astro:server:setup": ({ logger, server }) => {
        const base = audioBaseUrl();
        if (!base) {
          logger.warn(
            "PUBLIC_AUDIO_BASE_URL unset — missing static/audio clips stay 404 in dev",
          );
          return;
        }

        server.middlewares.use((req, res, next) => {
          const objectKey = localAudioObjectKey(req.url);
          if (!objectKey) {
            next();
            return;
          }

          const local = path.join(process.cwd(), "static", "audio", objectKey);
          if (existsSync(local)) {
            next();
            return;
          }

          void proxyMissingClip(`${base}/${toR2AudioKey(objectKey)}`, res, next);
        });
      },
    },
  };
}

async function proxyMissingClip(
  url: string,
  res: ServerResponse,
  next: (err?: unknown) => void,
): Promise<void> {
  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      next();
      return;
    }

    const body = Buffer.from(await upstream.arrayBuffer());
    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(body.byteLength));
    res.setHeader("Cache-Control", "no-store");
    res.end(body);
  } catch (error) {
    next(error);
  }
}
