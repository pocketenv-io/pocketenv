export function expandRepo(repo: string): string {
  const githubMatch = repo.match(/^github:([^/]+\/[^/]+)$/);
  if (githubMatch) return `https://github.com/${githubMatch[1]}`;

  const tangledMatch = repo.match(/^tangled:([^/]+\/[^/]+)$/);
  if (tangledMatch) return `https://tangled.org/${tangledMatch[1]}`;

  return repo;
}
