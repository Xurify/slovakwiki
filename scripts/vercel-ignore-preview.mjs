import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SKIPPED_DIRECTORY = /(?:^|\/)(?:docs|plans|\.cursor|\.agents|\.github)\//;
const SKIPPED_EXTENSION = /\.(?:md|mdc)$/;

/**
 * @param {string[]} files
 * @returns {boolean}
 */
export function previewBuildIsSkippable(files) {
  if (files.length === 0) {
    return false;
  }
  return files.every((file) => {
    const normalized = file.replaceAll("\\", "/");
    return SKIPPED_DIRECTORY.test(normalized) || SKIPPED_EXTENSION.test(normalized);
  });
}

/**
 * @param {string} previousSha
 * @param {string} commitSha
 * @returns {string[]}
 */
function changedFiles(previousSha, commitSha) {
  const output = execFileSync("git", ["diff", "--name-only", previousSha, commitSha], {
    encoding: "utf8",
  });
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function main() {
  if (process.env.VERCEL_ENV === "production") {
    process.exit(1);
  }

  const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA;
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (!(previousSha && commitSha)) {
    process.exit(1);
  }

  let files;
  try {
    files = changedFiles(previousSha, commitSha);
  } catch {
    process.exit(1);
  }

  if (!previewBuildIsSkippable(files)) {
    process.exit(1);
  }

  console.log("Skipping preview build; changes are docs only.");
  process.exit(0);
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(path.resolve(entry)).href) {
  main();
}
