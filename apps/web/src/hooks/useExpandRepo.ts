export const useExpandRepo = (repo?: string): string => {
  if (!repo) return "";

  const githubMatch = repo.match(/^github:([^/]+\/[^/]+)$/);
  if (githubMatch) return `https://github.com/${githubMatch[1]}`;

  const tangledMatch = repo.match(/^tangled:([^/]+\/[^/]+)$/);
  if (tangledMatch) return `https://tangled.org/${tangledMatch[1]}`;

  const gitlabMatch = repo.match(/^gitlab:([^/]+\/[^/]+)$/);
  if (gitlabMatch) return `https://gitlab.com/${gitlabMatch[1]}`;

  return repo;
};
