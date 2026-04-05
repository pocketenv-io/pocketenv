import ignore from "ignore";
import { readFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";

const IGNORE_FILE_NAMES = [
  ".pocketenvignore",
  ".gitignore",
  ".npmignore",
  ".dockerignore",
];

export type IgnoreContext = {
  /** Path of the ignore file's directory relative to the scan root. Empty string for root. */
  dir: string;
  ig: ReturnType<typeof ignore>;
};

/**
 * Recursively finds all ignore files under `root` and loads them into
 * per-directory contexts. Each context's patterns are scoped to its directory,
 * matching how git resolves nested .gitignore files.
 */
export async function loadIgnoreFiles(root: string): Promise<IgnoreContext[]> {
  const contexts: IgnoreContext[] = [];

  // readdir with recursive:true finds hidden ignore files (e.g. apps/api/.gitignore)
  // which Node.js glob("**/.gitignore") silently skips.
  const ignoreFileSet = new Set(IGNORE_FILE_NAMES);
  const candidates = (await readdir(root, { recursive: true })).filter(
    (entry) => ignoreFileSet.has(basename(entry)),
  );

  for (const file of candidates) {
    try {
      const ig = ignore();
      ig.add(await readFile(join(root, file), "utf8"));
      const dir = dirname(file);
      contexts.push({ dir: dir === "." ? "" : dir, ig });
    } catch {
      // skip unreadable files
    }
  }

  return contexts;
}

/**
 * Returns an `isIgnored(path)` function that checks a relative path against
 * all loaded ignore contexts.
 *
 * For each context whose directory is an ancestor of the path, the path is
 * made relative to that context's directory and then tested with the suffix
 * approach (see below).
 *
 * Why the suffix approach?
 * `ig.ignores('node_modules')` returns false for pattern `node_modules/`
 * (trailing slash = directory-only) because the ignore package requires the
 * tested path to end with `/` to match. Checking each path suffix both with
 * and without a trailing slash fixes this and also makes unanchored patterns
 * (e.g. `node_modules`) apply at any depth within the context's directory.
 */
export function makeIsIgnored(contexts: IgnoreContext[]) {
  return function isIgnored(path: string): boolean {
    return contexts.some(({ dir, ig }) => {
      const rel =
        dir === ""
          ? path
          : path.startsWith(dir + "/")
            ? path.slice(dir.length + 1)
            : null;

      if (rel === null) return false;

      const parts = rel.split("/");
      return parts.some((_, i) => {
        const sub = parts.slice(i).join("/");
        return ig.ignores(sub) || ig.ignores(sub + "/");
      });
    });
  };
}
