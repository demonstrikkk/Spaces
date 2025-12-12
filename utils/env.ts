/// <reference types="vite/client" />

export const getEnv = (key: string): string | undefined => {
    // Try localStorage first (for settings modal dynamic keys)
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`ENV_${key}`);
        if (stored) return stored;
    }
    // Fallback to .env (Vite injects these) - key should already have VITE_ prefix
    return import.meta.env[key];
};
