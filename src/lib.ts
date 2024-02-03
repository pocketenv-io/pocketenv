export async function spawn(
  name: string,
  args: string[],
  stdout: "inherit" | "piped" = "inherit"
): Promise<string> {
  const command = new Deno.Command(name, {
    args,
    stdout,
    stderr: "inherit",
  });
  const child = command.spawn();
  await child.status;
  if (stdout === "piped") {
    const output = await child.output();
    return new TextDecoder().decode(output.stdout).trim();
  }
  return "";
}
