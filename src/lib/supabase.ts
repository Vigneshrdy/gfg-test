// Supabase is no longer used — the app talks directly to the FastAPI backend.
// This file is kept as a stub so any residual imports do not break the build.

export const isDemoMode = false

// Minimal no-op supabase shape so old imports don't throw at runtime
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: new Error('Not implemented') }),
    signUp: async () => ({ error: new Error('Not implemented') }),
    signInWithOAuth: async () => ({ error: new Error('Not implemented') }),
    signOut: async () => {},
  },
}
