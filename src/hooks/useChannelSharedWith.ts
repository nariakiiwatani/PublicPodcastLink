import { supabase } from '../utils/supabase'

const ENDPOINT = `${import.meta.env.VITE_API_PATH}/shared_with` 

const get_db = async ({channel, email}:{channel?:string, email?: string}) => {
	let query = supabase.from('channel_shared_with').select('channel, shared_with')
	if(channel) query = query.match({channel})
	if(email) query = query.contains('shared_with', [email])
	const result = await query
	if(email) {
		result.data?.map(data=>({...data, shared_with: [email]}))
	}
	return (await query).data || []
}

const check_db = async ({channel, email}:{channel:string, email: string}) => {
	const got = await get_db({channel, email})
	return got!==null && got.length > 0
}

const post_db = async ({channel, email}:{channel:string, email: string}) => {
	const query_base = supabase.from('channel_shared_with')
	const current = await get_db({channel})
	if(current.length===0) {
		await query_base.insert({channel, shared_with: [email]})
		return [{channel, shared_with: [email]}]
	}
	return Promise.all(current.filter(({shared_with}) => !shared_with.includes(email))
	.map(async ({channel, shared_with})=> {
		const new_array = [...shared_with, email]
		await query_base.upsert({channel, shared_with: new_array})
		return {channel, shared_with: new_array}
	}))
}

const delete_db = async ({channel, email}:{channel:string, email: string}) => {
	const query_base = supabase.from('channel_shared_with')
	const current = await get_db({channel})
	return Promise.all(current.filter(({shared_with}) => shared_with.includes(email))
	.map(async ({channel, shared_with})=> {
		const new_array = shared_with.filter(e=>e!==email)
		await query_base.upsert({channel, shared_with: new_array})
		return {channel, shared_with: new_array}
	}))
}

export const useChannelSharedWith = () => {
	const get = (query:{channel?:string, email?: string}) => {
		return get_db(query)
	}
	const check = (query:{channel:string, email: string}) => {
		return check_db(query)
	}
	const add = (query:{channel:string, email: string}) => {
		return post_db(query)
	}
	const del = (query:{channel:string, email: string}) => {
		return delete_db(query)
	}
	return {check,add,del,get}
}