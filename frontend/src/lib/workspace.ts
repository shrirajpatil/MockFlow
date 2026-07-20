/**
 * Workspace identity.
 *
 * A workspace namespaces a user's workflows and their deployed API URLs
 * (/api/{workspace}/...). Previously this was a free-text field the user
 * typed themselves — two different people typing the same memorable name
 * (e.g. "shri23") landed in the same workspace and could see/edit each
 * other's data, since there was no ownership check at all.
 *
 * Fix: the workspace ID is now always generated locally with crypto.randomUUID()
 * (122 bits of randomness — collision is not a practical concern) and never
 * user-typed. To move a workspace to a second device/browser, the user copies
 * a "recovery code" (the same UUID, re-typeable) instead of inventing a name.
 */

const STORAGE_KEY = 'mockflow_workspace';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateWorkspaceId(): string {
    return crypto.randomUUID();
}

/** A short, human-scannable label derived from the full ID — safe to show in the UI. */
export function shortLabel(workspaceId: string): string {
    return workspaceId.slice(0, 8);
}

/** Returns the current device's workspace ID, creating one on first use. */
export function getOrCreateWorkspace(): string {
    if (typeof window === 'undefined') return '';
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const created = generateWorkspaceId();
    localStorage.setItem(STORAGE_KEY, created);
    return created;
}

/** Returns the current workspace ID, or null if none has been created yet. */
export function getWorkspace(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
}

export interface RestoreResult {
    ok: boolean;
    error?: string;
}

/**
 * Restores a workspace from a recovery code typed on a different device.
 * Validates the shape (a UUID) before accepting it — this is a format check,
 * not an ownership check; anyone who has the code can restore it, by design
 * (it functions like a private access token, not a public username).
 */
export function restoreWorkspace(code: string): RestoreResult {
    const trimmed = code.trim();
    if (!UUID_PATTERN.test(trimmed)) {
        return { ok: false, error: 'That doesn\'t look like a valid recovery code.' };
    }
    localStorage.setItem(STORAGE_KEY, trimmed.toLowerCase());
    return { ok: true };
}
