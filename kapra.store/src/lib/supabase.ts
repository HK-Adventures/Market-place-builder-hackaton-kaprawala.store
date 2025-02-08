import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid Supabase URL');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper functions for common auth operations
export const auth = {
  signIn: (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  },
  
  signOut: () => {
    return supabase.auth.signOut()
  },
  
  getSession: () => {
    return supabase.auth.getSession()
  },
  
  getUser: () => {
    return supabase.auth.getUser()
  }
} 