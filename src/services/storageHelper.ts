// Safe browser localStorage helper with fallback for SSR

const PURGE_FLAG = 'monarch_admin_mock_cache_purged_v3';

// Automatically purge legacy mock cache on client startup once
if (typeof window !== 'undefined') {
  try {
    if (!window.localStorage.getItem(PURGE_FLAG)) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('monarch_admin_') && key !== PURGE_FLAG && key !== 'monarch_admin_token' && key !== 'monarch_admin_user') {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      window.localStorage.setItem(PURGE_FLAG, 'true');
    }
  } catch (err) {
    console.warn('Could not auto-purge legacy mock storage:', err);
  }
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(`monarch_admin_${key}`);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`monarch_admin_${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing localStorage key "${key}":`, error);
  }
}

export function clearAdminStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('monarch_admin_') && key !== 'monarch_admin_token' && key !== 'monarch_admin_user') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch (error) {
    console.warn('Error clearing admin storage:', error);
  }
}
