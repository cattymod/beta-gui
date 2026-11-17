
/* =========================================================
   CattyMod - Custom Mod Runtime
   src/lib/mods.js
   ========================================================= */

const MOD_LIST_KEY = "cattymod:bookmarklet";
const MOD_STORAGE_PREFIX = "cattymod:bookmarklet:";

// Currently running mods
const runningMods = new Map();

/* ------------------------- Utilities ------------------------- */

function getModStorageKey(name) {
  return MOD_STORAGE_PREFIX +
    name.trim().replace(/\s+/g, "-");
}

function getModNames() {
  try {
    const saved = localStorage.getItem(MOD_LIST_KEY);
    const names = saved ? JSON.parse(saved) : [];

    return Array.isArray(names)
      ? names.filter(name => typeof name === "string")
      : [];
  } catch (error) {
    console.error("[CattyMod] Failed to read mod list:", error);
    return [];
  }
}

/* ------------------------- Mod Loading ------------------------- */

export function getCustomMods() {
  return getModNames().map(name => {
    const code = localStorage.getItem(
      getModStorageKey(name)
    );

    return {
      name,
      code: code || "",
      running: runningMods.has(name),
      available: Boolean(code)
    };
  });
}

/* ------------------------- Run One Mod ------------------------- */

export async function runCustomMod(name) {
  if (typeof name !== "string" || !name.trim()) {
    return false;
  }

  if (runningMods.has(name)) {
    return false;
  }

  const code = localStorage.getItem(
    getModStorageKey(name)
  );

  if (!code) {
    console.error(`[CattyMod] Mod "${name}" has no saved code.`);
    return false;
  }

  let source = code.trim();

  // Support bookmarklet-style code.
  if (source.startsWith("javascript:")) {
    source = source.slice("javascript:".length);

    try {
      source = decodeURIComponent(source);
    } catch {
      // Keep original source if it isn't URI-encoded.
    }
  }

  const controller = new AbortController();

  const instance = {
    controller,
    cleanup: null
  };

  runningMods.set(name, instance);

  const api = {
    name,
    signal: controller.signal,

    onCleanup(callback) {
      if (typeof callback === "function") {
        instance.cleanup = callback;
      }
    }
  };

  try {
    const AsyncFunction = Object.getPrototypeOf(
      async function () {}
    ).constructor;

    const execute = new AsyncFunction(
      "api",
      `"use strict";\n${source}`
    );

    const result = await execute(api);

    if (typeof result === "function") {
      instance.cleanup = result;
    }

    console.info(`[CattyMod] Started: ${name}`);

    return true;
  } catch (error) {
    console.error(
      `[CattyMod] Failed to run "${name}":`,
      error
    );

    runningMods.delete(name);
    return false;
  }
}

/* ------------------------- Start All Mods ------------------------- */

export async function startAllMods() {
  const mods = getCustomMods();
  const results = [];

  for (const mod of mods) {
    if (!mod.available || isModRunning(mod.name)) {
      continue;
    }

    const success = await runCustomMod(mod.name);

    results.push({
      name: mod.name,
      success
    });
  }

  const startedCount = results.filter(
    mod => mod.success
  ).length;

  console.info(
    `[CattyMod] Started ${startedCount}/${results.length} mods.`
  );

  return results;
}

/* ------------------------- Stop One Mod ------------------------- */

export function stopCustomMod(name) {
  const instance = runningMods.get(name);

  if (!instance) {
    return false;
  }

  instance.controller.abort();

  try {
    instance.cleanup?.();
  } catch (error) {
    console.error(
      `[CattyMod] Cleanup failed for "${name}":`,
      error
    );
  }

  runningMods.delete(name);

  console.info(`[CattyMod] Stopped: ${name}`);

  return true;
}

/* ------------------------- Stop All Mods ------------------------- */

export function stopAllCustomMods() {
  for (const name of [...runningMods.keys()]) {
    stopCustomMod(name);
  }
}

/* ------------------------- Mod Status ------------------------- */

export function isModRunning(name) {
  return runningMods.has(name);
}

export function getRunningMods() {
  return [...runningMods.keys()];
}
