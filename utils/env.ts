/// <reference types="vite/client" />

export const getEnv = (key: string): string | undefined => {
    // Try localStorage first (for settings modal dynamic keys)
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`ENV_${key}`);
        if (stored) return stored;
    }
    // Fallback to .env (Vite injects these)
    return import.meta.env[`VITE_${key}`];
};
