import { useState, useEffect, useMemo, useCallback, useContext } from 'react'
import { supabase, SessionContext } from '../utils/supabase'
const table_name = 'channel_shared_with'

const get_db = async ({channel, email}:{channel?:string, email?: string}) => {
	let query = supabase.from(table_name).select('channel, shared_with, owner_id')
	if(channel) query = query.match({channel})
	if(email) query = query.contains('shared_with', [email])
	const result = await query
	if(email) {
		result.data?.map(data=>({...data, shared_with: [email]}))
	}
	return (await query).data || []
}
const set_db = async (channel:string, items: string[]) => {
	await supabase.from(table_name).upsert({channel, shared_with:items})
	return items
}

export const useChannelSharedWith = (channel: string) => {
	const [result, setResult] = useState<string[]>([])
	useEffect(() => {
		get_db({channel})
		.then(result => result.find(({channel:ch})=>ch===channel)?.shared_with)
		.then(result => {
			if(!result) {
				return
			}
			setResult(result)
		})
		.catch(console.error)
	}, [channel])
	const set = (items:string[]) => {
		return set_db(channel, items)
		.then(setResult)
		.catch(console.error)
	}
	const check = (item: string) => {
		return result.includes(item)
	}
	const add = (new_value: string) => {
		return set([...result, new_value])
	}
	const del = (index: number) => {
		const new_array = [...result]
		new_array.splice(index,1)
		return set(new_array)
	}
	const edit = (index: number, new_value: string) => {
		const new_array = [...result]
		new_array[index] = new_value
		return set(new_array)
	}
	return {
		value:result,
		check,
		add,
		del,
		edit
	}
}

export const useEditableChannel = () => {
	const { session } = useContext(SessionContext)
	const email = useMemo(() => session?.user?.email, [session])
	const [{ result, owned, shared }, setResult] = useState<{result:string[],owned:string[],shared:string[]}>({result:[],owned:[],shared:[]})
	useEffect(() => {
		if(!email) return
		refresh()
	}, [email])
	const refresh = useCallback(() => {
		get_db({email})
		.then(result => {
			setResult({
				owned: result.filter(({owner_id})=>owner_id===session?.user?.id).map(({channel})=>channel),
				shared: result.filter(({owner_id})=>owner_id!==session?.user?.id).map(({channel})=>channel),
				result:result.map(({channel})=>channel)
			})
		})
		.catch(console.error)
	},[get_db, setResult])
	const check = useCallback((channel: string) => {
		return result.includes(channel)
	}, [result])
	const add = useCallback(async (channel: string) => {
		if(!email) return result
		const current = (await get_db({channel})).flatMap(({shared_with})=>shared_with)
		if(current.includes(email)) {
			return current
		}
		return set_db(channel, [...current, email])
	}, [email, get_db, set_db])
	const del = useCallback(async (channel: string) => {
		if(!email) return result
		const current = (await get_db({channel})).flatMap(({shared_with})=>shared_with)
		if(!current.includes(email)) {
			return current
		}
		return set_db(channel, current.filter(c=>c!==email))
	}, [email, get_db, set_db])

	return {
		value:result,
		owned,
		shared,
		check,
		add,
		del,
		refresh
	}
}