import { Session, createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase_database'
import { useEffect, useState } from 'react'

const env = (import.meta.env||process.env)
const supabaseUrl = env.VITE_SUPABASE_API_URL!
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const useSession = () => {
	const [session, setSession] = useState<Session | null>(null)

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
		})

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		})
	}, [])
	const logout = async () => {
		await supabase.auth.signOut()
	}
	return {
		session,
		logout
	}
}