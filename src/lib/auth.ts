// Front-end demo accounts (this browser only). Replace these functions with real API calls when the backend exists.
// NOTE: passwords are hashed with SHA-256 here only so they are never stored as plain text in the demo.
// A real backend must use a slow salted hash (argon2/bcrypt) on the server, never in the browser.
import { DEMO } from "./checkout";

export interface User {
  name: string;
  /** email or +country-code mobile number */
  id: string;
}
interface Stored extends User {
  hash: string;
}

const USERS = "rupaari.users";
const SESSION = "rupaari.session";
export const SESSION_EVENT = "rupaari:session";
const NOT_LIVE = { ok: false as const, message: "Accounts aren't connected yet." };

export type Provider = "google" | "apple" | "facebook";
const readUsers = (): Stored[] => {
  try {
    const v = JSON.parse(localStorage.getItem(USERS) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeUsers = (u: Stored[]) => {
  try {
    localStorage.setItem(USERS, JSON.stringify(u));
  } catch {
    /* storage unavailable */
  }
};
async function hash(id: string, password: string) {
  const data = new TextEncoder().encode(`rupaari:${id}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const isPassword = (v: string) => v.length >= 8;

export function getSession(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION) || localStorage.getItem(SESSION);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
function setSession(u: User, remember: boolean) {
  try {
    sessionStorage.removeItem(SESSION);
    localStorage.removeItem(SESSION);
    (remember ? localStorage : sessionStorage).setItem(SESSION, JSON.stringify(u));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function signOut() {
  try {
    sessionStorage.removeItem(SESSION);
    localStorage.removeItem(SESSION);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export const idTaken = (id: string) => readUsers().some((u) => u.id === id);

export async function signIn(id: string, password: string, remember: boolean): Promise<{ ok: boolean; message?: string }> {
  if (!DEMO) return NOT_LIVE;
  await wait(500);
  const h = await hash(id, password);
  const u = readUsers().find((x) => x.id === id && x.hash === h);
  if (!u) return { ok: false, message: "Email, mobile number or password is incorrect." };
  setSession({ name: u.name, id: u.id }, remember);
  return { ok: true };
}

/** Called after the SMS code is verified. */
export async function createAccount(name: string, id: string, password: string): Promise<{ ok: boolean; message?: string }> {
  if (!DEMO) return NOT_LIVE;
  if (idTaken(id)) return { ok: false, message: "An account with these details already exists. Try signing in." };
  const users = readUsers();
  users.push({ name, id, hash: await hash(id, password) });
  writeUsers(users);
  setSession({ name, id }, true);
  return { ok: true };
}

/** Called after the SMS code is verified. */
export async function resetPassword(id: string, password: string): Promise<{ ok: boolean; message?: string }> {
  if (!DEMO) return NOT_LIVE;
  const users = readUsers();
  const u = users.find((x) => x.id === id);
  if (u) {
    u.hash = await hash(id, password);
    writeUsers(users);
  }
  return { ok: true }; // same answer whether or not the number has an account
}

/**
 * Google / Apple / Facebook. Real sign-in needs an OAuth app for each provider (and a backend to exchange the code).
 * Demo mode signs in as a guest so the flow can be reviewed.
 */
export async function signInWithProvider(provider: Provider): Promise<{ ok: boolean; message?: string }> {
  if (!DEMO) return { ok: false, message: "Social sign-in isn't connected yet." };
  await wait(600);
  setSession({ name: "Guest", id: `guest@${provider}.demo` }, true);
  return { ok: true };
}

/** Only follow same-site paths from ?next= */
export const safeNext = (n: string | null, fallback = "/account") => (n && n.startsWith("/") && !n.startsWith("//") ? n : fallback);