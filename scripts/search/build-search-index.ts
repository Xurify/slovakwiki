import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as pagefind from "pagefind";

import { buildSearchDocuments } from "../../src/lib/catalog/search/documents";

export async function writeSearchIndex(outputPaths: string[]): Promise<number> {
  const { index, errors: createErrors } = await pagefind.createIndex({
    forceLanguage: "sk",
    verbose: false,
  });

  if (!index) {
    throw new Error(`Pagefind createIndex failed: ${createErrors.join("; ")}`);
  }

  const documents = buildSearchDocuments();

  for (const document of documents) {
    const { errors } = await index.addCustomRecord({
      url: document.url,
      content: document.content,
      language: "sk",
      meta: {
        title: document.title,
        kind: document.kind,
        summary: document.summary,
        ...(document.category ? { category: document.category } : {}),
        ...(document.register ? { register: document.register } : {}),
      },
      filters: {
        kind: [document.kind],
      },
    });

    if (errors.length > 0) {
      throw new Error(`Pagefind failed indexing ${document.url}: ${errors.join("; ")}`);
    }
  }

  for (const outputPath of outputPaths) {
    await rm(outputPath, { force: true, recursive: true });
    await mkdir(outputPath, { recursive: true });
    const { errors } = await index.writeFiles({ outputPath });
    if (errors.length > 0) {
      throw new Error(`Pagefind writeFiles failed (${outputPath}): ${errors.join("; ")}`);
    }
  }

  // Help local tooling / debugging know what was indexed.
  const manifestPath = path.join(outputPaths[0]!, "slovak-wiki-manifest.json");
  await writeFile(
    manifestPath,
    JSON.stringify(
      {
        count: documents.length,
        kinds: Object.fromEntries(
          [...new Set(documents.map((document) => document.kind))].map((kind) => [
            kind,
            documents.filter((document) => document.kind === kind).length,
          ]),
        ),
      },
      null,
      2,
    ),
  );

  await index.deleteIndex();
  return documents.length;
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectRun) {
  const root = process.cwd();
  const outputs = [path.join(root, "static", "pagefind")];
  const count = await writeSearchIndex(outputs);
  console.log(`Indexed ${count} search documents → ${outputs.join(", ")}`);
}
