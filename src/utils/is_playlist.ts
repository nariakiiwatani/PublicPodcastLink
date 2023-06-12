import { supabase } from './supabase'

export const is_playlist_url = (url:string): [boolean, string|null]=> {
	const match = url.match(/\/playlist\/([^/]+)\/rss/)
	if(match) {
		return [true, match[1]]
	}
	return [false, null]
}

export const playlist_alias_to_id_url = async (alias: string) => {
	const { data, error } = await supabase.from('playlist').select('channel').match({alias})
	if(error) {
		throw error
	}
	if(!data || data.length === 0) {
		throw new Error('alias not found in playlist')
	}
	return data[0].channel
}
