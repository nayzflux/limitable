export function encode(value: string): string {
  return Buffer.from(value).toString("base64");
}
