export default function redact(value: string) {
  if (value.length <= 14) {
    return value;
  }
  const visibleStart = value.slice(0, 11);
  const visibleEnd = value.slice(-3);
  const redactedMiddle = "*".repeat(24);
  return `${visibleStart}${redactedMiddle}${visibleEnd}`;
}
