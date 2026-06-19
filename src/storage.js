export function createLocalStorageAdapter() {
  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }

  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  return { save, load };
}
