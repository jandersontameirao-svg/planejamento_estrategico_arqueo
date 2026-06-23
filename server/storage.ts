// Storage local em disco (self-host). Substitui o proxy da Manus.
// Arquivos sao gravados em UPLOAD_DIR e servidos via /uploads pelo Express.
import { promises as fs } from "fs";
import path from "path";

export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads");

const PUBLIC_PREFIX = "/uploads";

function normalizeKey(relKey: string): string {
  // Remove barras iniciais e impede path traversal (../).
  const cleaned = relKey.replace(/^\/+/, "").replace(/\.\.(\/|\\|$)/g, "");
  return cleaned;
}

function publicUrl(key: string): string {
  return `${PUBLIC_PREFIX}/${key}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const fullPath = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  const buffer =
    typeof data === "string" ? Buffer.from(data) : Buffer.from(data as Uint8Array);
  await fs.writeFile(fullPath, buffer);
  return { key, url: publicUrl(key) };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: publicUrl(key) };
}
