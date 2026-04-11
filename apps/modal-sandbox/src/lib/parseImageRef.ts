export default function parseImageRef(ref: string): {
  registry?: string;
  name: string;
  tag: string;
} {
  const tagSeparatorIndex = ref.lastIndexOf(":");
  const slashBeforeTag = ref.lastIndexOf("/");

  const hasTag = tagSeparatorIndex > slashBeforeTag;

  const imageWithoutTag = hasTag ? ref.slice(0, tagSeparatorIndex) : ref;
  const tag = hasTag ? ref.slice(tagSeparatorIndex + 1) : "latest";

  const parts = imageWithoutTag.split("/");

  const isRegistry = (s: string) => s.includes(".") || s.includes(":");
  const registry = isRegistry(parts[0]!) ? parts[0] : "";
  const name = isRegistry(parts[0]!)
    ? parts.slice(1).join("/")
    : parts.join("/");

  return { registry, name, tag };
}
