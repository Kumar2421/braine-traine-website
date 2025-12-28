import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ccogznilfcqzpqtvbcne.supabase.co'
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_z3nH8L1gNAhMeNHx1Jie2Q_3TDe6Yjn'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
