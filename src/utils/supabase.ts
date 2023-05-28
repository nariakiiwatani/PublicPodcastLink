import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase_database'

const supabaseUrl = process.env.VITE_SUPABASE_API_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

