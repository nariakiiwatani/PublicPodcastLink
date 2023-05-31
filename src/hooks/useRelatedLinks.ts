import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../utils/supabase'
const table_name = 'related_link'

const get_db = async (channel: string) => {
	const result = await supabase.from(table_name)
	.select('link_url')
	.eq('channel', channel)
	if(!result?.data) {
		return []
	}
	return result.data.flatMap(({link_url})=>link_url)
}

const set_db = async (channel: string, item:string[]) => {
	await supabase.from(table_name).upsert({channel, link_url:item})
	return item
}

export const useRelatedLinks = (channel: string) => {
	const [result, setResult] = useState<string[]>([])
	useEffect(() => {
		get_db(channel)
		.then(setResult)
		.catch(console.error)
	}, [channel])
	const set = (items:string[]) => {
		return set_db(channel, items)
		.then(result => {
			setResult(result)
			return result
		})
		.catch(console.error)
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
	const value = useMemo(() => result.map(r=>({url:r,icon:getPlatformIcon(r)})), [result])
	return {
		value,
		add,
		del,
		edit
	}
}

export const getPlatformIcon = (url: string) => {
	const make_url = (name: string, ext: string = 'png') => `/platform_icons/${name}.${ext}`
	const approved_list:{[key:string]:string|string[]} = {
		'https://(.*\.)?github\.com': 'github',
		'https://(.*\.)?youtube\.com': 'youtube',
		'https://(.*\.)?twitter\.com': 'twitter',
		'https://podcasters.spotify\.com': 'sfpc',
		'https://(.*\.)?spotify\.com': 'spotify',
		'https://(.*\.)?note\.com': 'note',
		'https://(.*\.)?lit\.link': 'litlink',
		'https://(.*\.)?linktr\.ee': 'linktr',
		'https://(.*\.)?instagram\.com': 'instagram',
		'https://podcasts.google\.com': ['google_podcasts', 'svg'],
		'https://(.*\.)?facebook\.com': 'facebook',
		'https://podcasts.apple\.com': 'apple_podcasts',
		'https://music.amazon\.com': 'amazon_music',
		'https://(.*\.)?scrapbox\.io': 'scrapbox',
		'https://(.*\.)?discord\.com': 'discord',
		'https://(.*\.)?listen\.style': 'listen',
		'https://(.*\.)?zenn\.dev': 'zenn',
		'https://(.*\.)?qiita\.com': 'qiita',
		'https://(.*\.)?linkedin\.com': 'linkedin',
	}
	const found_key = Object.keys(approved_list).find(tester=>new RegExp(tester).test(url))
	if (found_key) {
		let args = approved_list[found_key]
		args = Array.isArray(args) ? args : [args]
		return make_url(args[0], args[1])
	}
	return null
}

