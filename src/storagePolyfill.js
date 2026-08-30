/**
 * storagePolyfill.js
 * ---------------------------------------------------------------------------
 * The original prototype was built as a Claude Artifact, where `window.storage`
 * is a host-provided key/value API (get/set/delete/list) backed by a real
 * server, with a `shared` flag that makes data visible to every viewer of the
 * artifact (used here for the "live dispatch board" everyone sees at once).
 *
 * That API does not exist in a plain browser / GitHub Pages / Vite build, so
 * this file re-implements the same method signatures on top of window.localStorage
 * and attaches them to `window.storage` before the app renders.
 *
 * IMPORTANT BEHAVIOR CHANGE — see BLOCKERS.md, item 1:
 * localStorage is per-browser only. The "shared" flag is accepted for API
 * compatibility but does NOT sync data across tabs/devices/users the way the
 * original Claude-hosted storage did. Every person who opens this app gets
 * their own independent board, not a shared live one.
 */

const NAMESPACE = "reflex_storage__";

function fullKey(key, shared) {
  return `${NAMESPACE}${shared ? "shared__" : "private__"}${key}`;
}

function isValidKey(key) {
  return typeof key === "string" && key.length > 0 && key.length < 200 && !/[\s/\\'"]/.test(key);
}

async function get(key, shared = false) {
  if (!isValidKey(key)) throw new Error(`Invalid key: ${key}`);
  const raw = window.localStorage.getItem(fullKey(key, shared));
  if (raw === null) return null;
  return { key, value: raw, shared };
}

async function set(key, value, shared = false) {
  if (!isValidKey(key)) throw new Error(`Invalid key: ${key}`);
  window.localStorage.setItem(fullKey(key, shared), value);
  return { key, value, shared };
}

async function del(key, shared = false) {
  if (!isValidKey(key)) throw new Error(`Invalid key: ${key}`);
  const existed = window.localStorage.getItem(fullKey(key, shared)) !== null;
  window.localStorage.removeItem(fullKey(key, shared));
  return { key, deleted: existed, shared };
}

async function list(prefix = "", shared = false) {
  const scope = `${NAMESPACE}${shared ? "shared__" : "private__"}`;
  const keys = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(scope)) {
      const shortKey = k.slice(scope.length);
      if (shortKey.startsWith(prefix)) keys.push(shortKey);
    }
  }
  return { keys, prefix, shared };
}

export function installStoragePolyfill() {
  if (typeof window === "undefined") return;
  if (window.storage && window.storage.__isReflexPolyfill) return;
  window.storage = { get, set, delete: del, list, __isReflexPolyfill: true };
}
