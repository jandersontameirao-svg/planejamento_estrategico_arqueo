// Autenticacao local de administrador (self-host, sem depender do OAuth da Manus).
// Credenciais vem do .env: ADMIN_EMAIL e ADMIN_PASSWORD.
import crypto from "crypto";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";

export const ADMIN_OPEN_ID = "local-admin";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf-8");
  const bb = Buffer.from(b, "utf-8");
  // timingSafeEqual exige buffers de mesmo tamanho; compara o hash pra evitar
  // vazar o comprimento e manter tempo constante.
  const ah = crypto.createHash("sha256").update(ab).digest();
  const bh = crypto.createHash("sha256").update(bb).digest();
  return crypto.timingSafeEqual(ah, bh);
}

export function verifyAdminCredentials(email: string, senha: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedSenha = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedSenha) {
    throw new Error(
      "ADMIN_EMAIL e ADMIN_PASSWORD precisam estar configurados no .env"
    );
  }
  const emailOk = safeEqual(
    email.trim().toLowerCase(),
    expectedEmail.trim().toLowerCase()
  );
  const senhaOk = safeEqual(senha, expectedSenha);
  return emailOk && senhaOk;
}

// Garante que o usuario admin exista no banco com papel "admin".
// Assim authenticateRequest encontra o usuario localmente e nunca chama a Manus.
export async function ensureLocalAdmin(
  email: string
): Promise<{ openId: string; name: string }> {
  const name = "Administrador";
  const db = await getDb();
  if (db) {
    await db
      .insert(users)
      .values({
        openId: ADMIN_OPEN_ID,
        name,
        email,
        loginMethod: "local",
        role: "admin",
        lastSignedIn: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: { role: "admin", email, lastSignedIn: new Date() },
      });
  }
  return { openId: ADMIN_OPEN_ID, name };
}
