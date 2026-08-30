/**
 * storagePolyfill.js
 * ---------------------------------------------------------------------------
 * Supabase-backed replacement for Claude Artifact's window.storage API.
 *
 * The original Claude Artifact used:
 *
 *   window.storage.get(key, true)
 *   window.storage.set(key, value, true)
 *
 * where the "shared" flag meant that all viewers of the artifact could
 * access the same shared data.
 *
 * This version keeps the same API so App.jsx does not need to be rewritten.
 * Instead of browser localStorage, shared data is stored in Supabase.
 */

import { supabase } from "./supabaseClient";

const SHARED_TABLE = "shared_app_state";

/**
 * Validate storage keys.
 */
function isValidKey(key) {
  return (
    typeof key === "string" &&
    key.length > 0 &&
    key.length < 200 &&
    !/[\s/\\'"]/.test(key)
  );
}

/**
 * Get a value from storage.
 *
 * App.jsx expects:
 * {
 *   key,
 *   value,
 *   shared
 * }
 */
async function get(key, shared = false) {
  if (!isValidKey(key)) {
    throw new Error(`Invalid key: ${key}`);
  }

  // Shared data is stored in Supabase.
  if (shared) {
    const { data, error } = await supabase
      .from(SHARED_TABLE)
      .select("value")
      .eq("id", key)
      .maybeSingle();

    if (error) {
      console.error("Supabase storage get error:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      key,
      value: typeof data.value === "string"
        ? data.value
        : JSON.stringify(data.value),
      shared: true,
    };
  }

  // Private data can remain browser-local for now.
  const raw = window.localStorage.getItem(`reflex_storage__private__${key}`);

  if (raw === null) {
    return null;
  }

  return {
    key,
    value: raw,
    shared: false,
  };
}

/**
 * Save a value to storage.
 */
async function set(key, value, shared = false) {
  if (!isValidKey(key)) {
    throw new Error(`Invalid key: ${key}`);
  }

  // Shared data goes to Supabase.
  if (shared) {
    const { error } = await supabase
      .from(SHARED_TABLE)
      .upsert({
        id: key,
        value: value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Supabase storage set error:", error);
      throw error;
    }

    return {
      key,
      value,
      shared: true,
    };
  }

  // Private data remains browser-local.
  window.localStorage.setItem(
    `reflex_storage__private__${key}`,
    value
  );

  return {
    key,
    value,
    shared: false,
  };
}

/**
 * Delete a value.
 *
 * This is retained for compatibility with the original storage API.
 */
async function del(key, shared = false) {
  if (!isValidKey(key)) {
    throw new Error(`Invalid key: ${key}`);
  }

  if (shared) {
    const { data, error } = await supabase
      .from(SHARED_TABLE)
      .delete()
      .eq("id", key)
      .select("id");

    if (error) {
      console.error("Supabase storage delete error:", error);
      throw error;
    }

    return {
      key,
      deleted: data && data.length > 0,
      shared: true,
    };
  }

  const storageKey = `reflex_storage__private__${key}`;
  const existed = window.localStorage.getItem(storageKey) !== null;

  window.localStorage.removeItem(storageKey);

  return {
    key,
    deleted: existed,
    shared: false,
  };
}

/**
 * List storage keys.
 *
 * Retained for compatibility with the original API.
 */
async function list(prefix = "", shared = false) {
  if (shared) {
    const { data, error } = await supabase
      .from(SHARED_TABLE)
      .select("id");

    if (error) {
      console.error("Supabase storage list error:", error);
      throw error;
    }

    const keys = (data || [])
      .map((row) => row.id)
      .filter((key) => key.startsWith(prefix));

    return {
      keys,
      prefix,
      shared: true,
    };
  }

  const scope = "reflex_storage__private__";
  const keys = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);

    if (key && key.startsWith(scope)) {
      const shortKey = key.slice(scope.length);

      if (shortKey.startsWith(prefix)) {
        keys.push(shortKey);
      }
    }
  }

  return {
    keys,
    prefix,
    shared: false,
  };
}

/**
 * Install the storage API before the application uses it.
 */
export function installStoragePolyfill() {
  if (typeof window === "undefined") return;

  if (window.storage && window.storage.__isReflexPolyfill) {
    return;
  }

  window.storage = {
    get,
    set,
    delete: del,
    list,
    __isReflexPolyfill: true,
  };
}