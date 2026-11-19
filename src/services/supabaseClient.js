import { createClient } from '@supabase/supabase-js';

// Get credentials from Vite environment variables or localStorage overrides
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env?.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem('poolsplit_supabase_url');
  const storedKey = localStorage.getItem('poolsplit_supabase_key');

  const url = storedUrl || envUrl;
  const key = storedKey || envKey;

  const isConfigured = Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    !url.includes('your-project-id') &&
    key.length > 20
  );

  return { url, key, isConfigured };
};

let clientInstance = null;
let currentUrl = '';
let currentKey = '';

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  if (clientInstance && currentUrl === url && currentKey === key) {
    return clientInstance;
  }

  try {
    clientInstance = createClient(url, key, {
      auth: { persistSession: true },
    });
    currentUrl = url;
    currentKey = key;
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const saveSupabaseConfig = (url, key) => {
  if (url && key) {
    localStorage.setItem('poolsplit_supabase_url', url.trim());
    localStorage.setItem('poolsplit_supabase_key', key.trim());
  } else {
    localStorage.removeItem('poolsplit_supabase_url');
    localStorage.removeItem('poolsplit_supabase_key');
  }
  clientInstance = null; // force reload client
};
