import { useState, useEffect, useMemo, useCallback, useContext } from 'react'
import { supabase, SessionContext } from '../utils/supabase'
import { Session } from '@supabase/supabase-js'
const table_name = 'channel_shared_with'

const includes_icase = (array: string[], value: string) => array.some(a=>a.toLowerCase()===value.toLowerCase())

const get_shared_members = async (url: string) => {
	const {data, error} = await supabase.from(table_name).select('shared_with').eq('channel', url)
	if(error) {
		throw new Error()
	}
	if(!data || data.length === 0) {
		return []
	}
	return data.flatMap(data=>data.shared_with)
}

const get_editable_channels = async (session: Session) => {
	const {data, error} = await supabase.from(table_name).select('channel, shared_with, owner_id')
	if(error) {
		throw new Error()
	}
	if(!data || data.length === 0) {
		return {
			owned: [],
			shared: []
		}
	}
	const ret = {
		owned: data.filter(data=>data.owner_id === session?.user.id).map(data=>data.channel),
		shared: data.filter(data=>includes_icase(data.shared_with, session?.user.email??'')).map(data=>data.channel)
	}
	ret.shared = ret.shared.filter(channel=>!includes_icase(ret.owned, channel))
	return ret
}

const set_db = async (channel:string, items: string[]) => {
	await supabase.from(table_name).upsert({channel, shared_with:items})
	return items
}

const insert_db = async (channel:string) => {
	await supabase.from(table_name).insert({channel, shared_with:[]})
	return []
}

export const useChannelSharedWith = (channel: string) => {
	const [result, setResult] = useState<string[]>([])
	useEffect(() => {
		get_shared_members(channel)
		.then(setResult)
		.catch(console.error)
	}, [channel])
	const set = (items:string[]) => {
		return set_db(channel, items)
		.then(setResult)
		.catch(console.error)
	}
	const check = (item: string) => {
		return includes_icase(result, item)
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
		if(!session) return
		refresh()
	}, [session])
	const refresh = useCallback(() => {
		if(!session) return
		get_editable_channels(session)
		.then(result => {
			setResult({
				...result,
				result: [...result.owned, ...result.shared]
			})
		})
		.catch(console.error)
	},[get_editable_channels, setResult])
	const check = useCallback((channel: string) => {
		return includes_icase(result, channel)
	}, [result])
	const add = useCallback(async (channel: string) => {
		if(!email) return result
		if(owned.includes(channel)) return result
		const current = await get_shared_members(channel)
		if(includes_icase(current, email)) {
			return current
		}
		return set_db(channel, [...current, email])
	}, [email, owned, get_shared_members, set_db])
	const insert = useCallback(async (channel: string) => {
		if(owned.includes(channel)) return result
		return insert_db(channel)
	}, [owned, insert_db])
	const del = useCallback(async (channel: string) => {
		if(!email) return result
		if(owned.includes(channel)) return result
		const current = await get_shared_members(channel)
		if(!includes_icase(current, email)) {
			return current
		}
		return set_db(channel, current.filter(c=>c!==email))
	}, [email, owned, get_shared_members, set_db])

	return {
		value:result,
		owned,
		shared,
		check,
		add,
		insert,
		del,
		refresh
	}
}