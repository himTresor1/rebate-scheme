import { projectId } from './supabase/info';

const DEFAULT_REMOTE_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-324f6e20`;

function sanitizeBase(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getFunctionsBaseUrl() {
  const runtimeOverride = (globalThis as any).__FUNCTIONS_BASE_URL__ as string | undefined;
  if (runtimeOverride && runtimeOverride.trim()) {
    return sanitizeBase(runtimeOverride.trim());
  }
  return DEFAULT_REMOTE_BASE;
}

export function buildFunctionsUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getFunctionsBaseUrl()}${normalizedPath}`;
}

