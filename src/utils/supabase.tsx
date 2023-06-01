import { Session, createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase_database'
import { useEffect, useState, createContext } from 'react'

const env = (import.meta.env||process.env)
const supabaseUrl = env.VITE_SUPABASE_API_URL!
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const SessionContext = createContext<ReturnType<typeof useSession>>({session:null,logout:()=>Promise.resolve()})
export const SessionProvider = ({children}:{children:React.ReactNode}) => {
	const session = useSession()
	return <SessionContext.Provider value={session}>
		{children}
	</SessionContext.Provider>
}

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