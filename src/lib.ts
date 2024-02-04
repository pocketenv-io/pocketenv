export async function spawn(
  name: string,
  args: string[],
  stdout: "inherit" | "piped" = "inherit",
  cwd = Deno.cwd()
): Promise<string> {
  const command = new Deno.Command(name, {
    args,
    stdout,
    stderr: "inherit",
    cwd,
  });
  const child = command.spawn();
  await child.status;
  if (stdout === "piped") {
    const output = await child.output();
    return new TextDecoder().decode(output.stdout).trim();
  }
  return "";
}

export async function getDefaultGithubBranch(repo: string) {
  // https://api.github.com/repos/pocketenv-io/nix
  const data = await fetch(`https://api.github.com/repos/${repo}`).then((res) =>
    res.json()
  );
  return data.default_branch;
}
