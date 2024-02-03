export async function spawn(name: string, args: string[]): Promise<void> {
  const command = new Deno.Command(name, {
    args,
    stdout: "inherit",
    stderr: "inherit",
  });
  const child = command.spawn();
  await child.status;
}
