import "server-only";
import path from "node:path";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { DATA_DIR, deleteUserFiles, newId, readJsonLocked, updateJson } from "./storage";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "maleta_session";
const SESSION_DAYS = 30;
const RESET_MINUTES = 60;

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}
interface Session {
  tokenHash: string;
  userId: string;
  expiresAt: string;
}
interface ResetToken {
  tokenHash: string;
  userId: string;
  expiresAt: string;
}
interface AuthDb {
  users: User[];
  sessions: Session[];
  resets: ResetToken[];
}

const AUTH_FILE = () => path.join(/*turbopackIgnore: true*/ DATA_DIR, "auth.json");
const emptyAuth = (): AuthDb => ({ users: [], sessions: [], resets: [] });

export type PublicUser = Pick<User, "id" | "email" | "name" | "createdAt">;
const toPublic = (u: User): PublicUser => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt });

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (pw.length > 200) return "La contraseña es demasiado larga.";
  return null;
}

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, saltHex, keyHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !keyHex) return false;
  const key = await scrypt(pw, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

// Hash ficticio para igualar tiempos cuando el email no existe.
let dummyHash: Promise<string> | null = null;

// ---------- Limitación de intentos (en memoria, por proceso) ----------
const attempts = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  a.count++;
  return a.count <= max;
}

// ---------- Usuarios ----------

export async function createUser(input: { email: string; name: string; password: string }): Promise<PublicUser> {
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  return updateJson(AUTH_FILE(), emptyAuth, (db) => {
    if (db.users.some((u) => u.email === email)) throw new AuthError("EMAIL_TAKEN");
    const user: User = {
      id: newId(),
      email,
      name: input.name.trim().slice(0, 60),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return toPublic(user);
  });
}

export class AuthError extends Error {
  constructor(public code: "EMAIL_TAKEN" | "INVALID") {
    super(code);
  }
}

export async function authenticate(emailRaw: string, password: string): Promise<PublicUser | null> {
  const email = normalizeEmail(emailRaw);
  const db = await readJsonLocked(AUTH_FILE(), emptyAuth);
  const user = db.users.find((u) => u.email === email);
  if (!user) {
    dummyHash ??= hashPassword("dummy-password");
    await verifyPassword(password, await dummyHash);
    return null;
  }
  return (await verifyPassword(password, user.passwordHash)) ? toPublic(user) : null;
}

// ---------- Sesiones ----------

export async function startSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await updateJson(AUTH_FILE(), emptyAuth, (db) => {
    const now = new Date().toISOString();
    db.sessions = db.sessions.filter((s) => s.expiresAt > now);
    db.sessions.push({ tokenHash: sha256(token), userId, expiresAt: expires.toISOString() });
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    expires,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const h = sha256(token);
    await updateJson(AUTH_FILE(), emptyAuth, (db) => {
      db.sessions = db.sessions.filter((s) => s.tokenHash !== h);
    });
  }
  jar.delete(SESSION_COOKIE);
}

/** Usuario de la sesión actual, o null. Memorizado por petición. */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const h = sha256(token);
  const db = await readJsonLocked(AUTH_FILE(), emptyAuth);
  const now = new Date().toISOString();
  const session = db.sessions.find((s) => s.tokenHash === h && s.expiresAt > now);
  if (!session) return null;
  const user = db.users.find((u) => u.id === session.userId);
  return user ? toPublic(user) : null;
});

/** Exige sesión: redirige a /login si no la hay. Usar en páginas y acciones. */
export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// ---------- Recuperación de contraseña ----------

/** Crea un token de recuperación si el email existe. Devuelve el token en claro (solo para enviarlo). */
export async function createResetToken(emailRaw: string): Promise<{ token: string; user: PublicUser } | null> {
  const email = normalizeEmail(emailRaw);
  const token = randomBytes(32).toString("base64url");
  return updateJson(AUTH_FILE(), emptyAuth, (db) => {
    const user = db.users.find((u) => u.email === email);
    if (!user) return null;
    const now = new Date().toISOString();
    db.resets = db.resets.filter((r) => r.expiresAt > now && r.userId !== user.id);
    db.resets.push({
      tokenHash: sha256(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_MINUTES * 60_000).toISOString(),
    });
    return { token, user: toPublic(user) };
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const h = sha256(token);
  const passwordHash = await hashPassword(newPassword);
  return updateJson(AUTH_FILE(), emptyAuth, (db) => {
    const now = new Date().toISOString();
    const r = db.resets.find((x) => x.tokenHash === h && x.expiresAt > now);
    if (!r) return false;
    const user = db.users.find((u) => u.id === r.userId);
    if (!user) return false;
    user.passwordHash = passwordHash;
    db.resets = db.resets.filter((x) => x.userId !== user.id);
    // Cierra todas las sesiones abiertas tras cambiar la contraseña.
    db.sessions = db.sessions.filter((s) => s.userId !== user.id);
    return true;
  });
}

export async function isResetTokenValid(token: string): Promise<boolean> {
  const h = sha256(token);
  const db = await readJsonLocked(AUTH_FILE(), emptyAuth);
  const now = new Date().toISOString();
  return db.resets.some((r) => r.tokenHash === h && r.expiresAt > now);
}

export async function updateProfile(userId: string, name: string): Promise<void> {
  await updateJson(AUTH_FILE(), emptyAuth, (db) => {
    const u = db.users.find((x) => x.id === userId);
    if (u) u.name = name.trim().slice(0, 60);
  });
}

export async function deleteAccount(userId: string): Promise<void> {
  await updateJson(AUTH_FILE(), emptyAuth, (db) => {
    db.users = db.users.filter((u) => u.id !== userId);
    db.sessions = db.sessions.filter((s) => s.userId !== userId);
    db.resets = db.resets.filter((r) => r.userId !== userId);
  });
  await deleteUserFiles(userId);
}
