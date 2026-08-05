import type { DictionaryExportFile, ExportOptions } from "./types";
import { buildDownloadPayloads, projectExport } from "./serialize";

/** Trigger a browser download for a text blob. */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Project + serialize the loaded export file and trigger one or two downloads.
 * Dual tabular files use a short gap so Safari doesn't drop the second save.
 */
export async function exportAndDownload(
  file: DictionaryExportFile,
  options: ExportOptions,
): Promise<number> {
  const projected = projectExport(file.words, options);
  const payloads = buildDownloadPayloads(
    {
      generatedAt: file.generatedAt,
      source: file.source,
      attribution: file.attribution,
    },
    projected,
    options,
  );

  for (const [index, payload] of payloads.entries()) {
    if (index > 0) {
      await sleep(150);
    }

    downloadBlob(payload.filename, new Blob([payload.body], { type: payload.mime }));
  }

  return payloads.length;
}
