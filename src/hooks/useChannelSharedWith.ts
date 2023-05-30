const ENDPOINT = `${import.meta.env.VITE_API_PATH}/shared_with` 

const get_db = async (channel: string, email: string): Promise<boolean> => {
	const url = `${ENDPOINT}?channel=${channel}&email=${email}`
	const result = await fetch(url)
	return result.ok && await result.json()===true
}

const post_db = async (channel: string, email: string): Promise<boolean> => {
	const url = `${ENDPOINT}?channel=${channel}&email=${email}`
	const result = await fetch(url, {
		method: 'POST'
	})
	return result.ok
}

const delete_db = async (channel: string, email: string): Promise<boolean> => {
	const url = `${ENDPOINT}?channel=${channel}&email=${email}`
	const result = await fetch(url, {
		method: 'DELETE'
	})
	return result.ok
}

export const useChannelSharedWith = (email?: string) => {
	const get = async (url: string) => {
		if(!email) return false
		return await get_db(url, email)
	}
	const add = async (url: string) => {
		if(!email) return false
		return await post_db(url, email)
	}
	const del = async (url: string) => {
		if(!email) return false
		return await delete_db(url, email)
	}
	return {get,add,del}
}