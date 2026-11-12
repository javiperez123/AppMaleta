import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { emptyUserData, type UserData } from "@/lib/domain/types";

/**
 * Almacenamiento en ficheros JSON (sin dependencias ni servicios externos).
 *
 * - `auth.json`: usuarios, sesiones y tokens de recuperación (solo hashes).
 * - `users/<userId>.json`: datos de cada usuario (armario, viajes, favoritos).
 * - `uploads/<userId>/`: fotos de cada usuario.
 *
 * El aislamiento entre usuarios es estructural: todas las funciones de datos
 * reciben el userId de la sesión y solo pueden leer el fichero de ese usuario.
 * Pensado para una sola instancia (desarrollo, demo o piloto). Para producción
 * con varias instancias, sustituir este módulo por una base de datos (ver docs/LANZAMIENTO.md).
 */

export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));

const SAFE_ID = /^[a-zA-Z0-9_-]{8,64}$/;
export function assertSafeId(id: string): void {
  if (!SAFE_ID.test(id)) throw new Error("Identificador no válido");
}

export function newId(): string {
  return randomUUID().replace(/-/g, "");
}

// Cola de escritura por fichero para evitar condiciones de carrera dentro del proceso.
const locks = new Map<string, Promise<unknown>>();
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(
    key,
    next.catch(() => undefined),
  );
  return next;
}

async function readJson<T>(file: string, fallback: () => T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback();
    throw e;
  }
}

async function writeJsonAtomic(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 1), "utf8");
  await fs.rename(tmp, file);
}

/** Lee y modifica un JSON de forma atómica y serializada. */
export async function updateJson<T, R>(file: string, fallback: () => T, fn: (data: T) => R | Promise<R>): Promise<R> {
  return withLock(file, async () => {
    const data = await readJson(file, fallback);
    const result = await fn(data);
    await writeJsonAtomic(file, data);
    return result;
  });
}

export async function readJsonLocked<T>(file: string, fallback: () => T): Promise<T> {
  return withLock(file, () => readJson(file, fallback));
}

// ---------- Datos de usuario ----------

function userFile(userId: string): string {
  assertSafeId(userId);
  return path.join(DATA_DIR, "users", `${userId}.json`);
}

export async function readUserData(userId: string): Promise<UserData> {
  return readJsonLocked(userFile(userId), emptyUserData);
}

export async function updateUserData<R>(userId: string, fn: (d: UserData) => R | Promise<R>): Promise<R> {
  return updateJson(userFile(userId), emptyUserData, fn);
}

export async function deleteUserFiles(userId: string): Promise<void> {
  assertSafeId(userId);
  await fs.rm(userFile(userId), { force: true });
  await fs.rm(path.join(DATA_DIR, "uploads", userId), { recursive: true, force: true });
}

// ---------- Fotos ----------

export function uploadDir(userId: string): string {
  assertSafeId(userId);
  return path.join(DATA_DIR, "uploads", userId);
}
