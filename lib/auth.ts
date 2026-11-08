import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "btg_admin";
function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  return value;
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
export function makeSession() {
  const payload = `${Date.now() + 1000 * 60 * 60 * 12}`;
  return `${payload}.${sign(payload)}`;
}
export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature || Number(expiry) < Date.now()) return false;
  const expected = sign(expiry);
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
export const ADMIN_COOKIE = COOKIE;
