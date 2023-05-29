import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { supabase } from '../../src/utils/supabase'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

export type ReturnType = {
	id?: string,
	data: {
		url: string,
		icon: string | null
	}[]
} | null

const makeResult = ({ data, count, error }:PostgrestSingleResponse<{
    id: number;
    link_url: string[];
}>) => {
	if (error) {
		throw {
			statusCode: 406
		}
	}
	if (!data || count === 0) {
		throw {
			statusCode: 404
		}
	}
	return {
		statusCode: 200,
		body: JSON.stringify({
			id: data.id,
			data: data.link_url
			.filter(url=>url&&url.length>0)
			.map(url => ({
				url,
				icon: getPlatformIcon(url)
			})
			)
		}),
	}
}
const get = async (event: HandlerEvent, _context: HandlerContext) => {
	const { channel } = event.queryStringParameters as { channel: string }
	if (!channel) {
		throw {
			statusCode: 400
		}
	}
	const result = await supabase.from('related_link')
		.select('id,link_url')
		.eq('rss_url', channel)
	if(!result.data || result.data.length === 0) {
		return {
			statusCode: 404
		}
	}
	return makeResult({
		...result, data: result.data[0]
	})
}
const insert = async (event: HandlerEvent, _context: HandlerContext) => {
	const { channel } = event.queryStringParameters as { channel: string }
	if (!channel) {
		throw {
			statusCode: 400
		}
	}
	const result = await supabase.from('related_link')
		.insert({rss_url:channel, link_url:event.body?.split(',')??[]})
		.select('id,link_url')
		.single()
	return makeResult(result)
}
const update = async (event: HandlerEvent, _context: HandlerContext) => {
	const id = event.path.split('/').slice(-1)[0]
	if (!id) {
		throw {
			statusCode: 400
		}
	}
	const result = await supabase.from('related_link')
		.update({link_url:event.body?.split(',')??[]})
		.eq('id', id)
		.select('id,link_url')
		.single()
	return makeResult(result)
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
	try {
		switch (event.httpMethod) {
			case 'GET': return get(event, context)
			case 'POST': return insert(event, context)
			case 'PUT': return update(event, context)
			default:
				return {
					statusCode: 400
				}
		}
	}
	catch (e: any) {
		return {
			statusCode: e.statusCode??500,
			body: e.message
		}
	}
}
export const getPlatformIcon = (url: string) => {
	const make_url = (name: string, ext: string = 'png') => `/platform_icons/${name}.${ext}`
	const approved_list:{[key:string]:string|string[]} = {
		'https://github.com': 'github',
		'https://youtube.com': 'youtube',
		'https://twitter.com': 'twitter',
		'https://open.spotify.com': 'spotify',
		'https://podcasters.spotify.com': 'sfpc',
		'https://note.com': 'note',
		'https://lit.link': 'litlink',
		'https://linktr.ee': 'linktr',
		'https://www.instagram.com': 'instagram',
		'https://podcasts.google.com': ['google-podcasts', 'svg'],
		'https://www.facebook.com': 'facebook',
		'https://podcasts.apple.com': 'apple_podcasts',
		'https://music.amazon.com': 'amazon_music',
		'https://scrapbox.io': 'scrapbox'
	}
	const found_key = Object.keys(approved_list).find(origin=>url.startsWith(origin))
	if (found_key) {
		let args = approved_list[found_key]
		args = Array.isArray(args) ? args : [args]
		return make_url(args[0], args[1])
	}
	return null
}

