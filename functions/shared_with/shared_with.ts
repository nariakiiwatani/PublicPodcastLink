import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { supabase } from '../../src/utils/supabase'

const table_name = 'channel_shared_with'

const get = async (event: HandlerEvent, _context: HandlerContext) => {
	const { channel, email } = event.queryStringParameters as { channel: string, email: string }
	if (!channel && !email) {
		return {
			statusCode: 400
		}
	}
	let query = supabase.from(table_name)
	.select('channel, shared_with')
	if(channel) query = query.match({channel})
	if(email) query = query.contains('shared_with', [email])
	const result = await query;
	if(!result?.data) {
		return {
			statusCode: 404
		}
	}
	return {
		statusCode: 200,
		body: JSON.stringify(result?.data??[]),
	}
}
const upsert = async (event: HandlerEvent, _context: HandlerContext) => {
	const { channel, email } = event.queryStringParameters as { channel: string, email: string }
	if (!channel || !email) {
		return {
			statusCode: 400
		}
	}
	const current = (await supabase.from(table_name)
		.select('shared_with')
		.eq('channel', channel)
		)?.data?.[0]?.shared_with
	if(current && current.includes(email)) {
		return {
			statusCode: 406
		}
	}
	const new_data = !current ? [email] : [...current, email]
	const result = await supabase.from(table_name)
		.upsert({channel, shared_with:new_data})
		.contains('shared_with', [email])
	if(!result || result.error) {
		return {
			statusCode: Number(result.error.code)??500
		}
	}
	return {
		statusCode: 201
	}
}

const delete_db = async (event: HandlerEvent, _context: HandlerContext) => {
	const { channel, email } = event.queryStringParameters as { channel: string, email: string }
	if (!channel || !email) {
		return {
			statusCode: 400
		}
	}
	const current = (await supabase.from(table_name)
		.select('shared_with')
		.eq('channel', channel)
		)?.data?.[0]?.shared_with
	if(!current || !current.includes(email)) {
		return {
			statusCode: 404
		}
	}
	const new_data = current.filter(data=>data!==email)
	const result = await supabase.from(table_name)
		.upsert({channel, shared_with:new_data})
		.contains('shared_with', [email])
	if(!result || result.error) {
		return {
			statusCode: Number(result.error.code)??500
		}
	}
	return {
		statusCode: 200
	}
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
	try {
		switch (event.httpMethod) {
			case 'GET': return get(event, context)
			case 'POST':
			case 'PUT': return upsert(event, context)
			case 'DELETE': return delete_db(event, context)
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
