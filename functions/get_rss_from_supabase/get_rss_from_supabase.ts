import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"
import { supabase } from '../../src/utils/supabase'

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
	const { id } = event.queryStringParameters as { id: string }

	let { data, error } = await supabase
		.from('playlist')
		.select('rss')
		.eq('alias', id)

	if (error) {
		return {
			statusCode: 500,
			body: 'An error occurred: ' + error.message,
		}
	}
	if (!data || data.length === 0) {
		return {
			statusCode: 404,
			body: 'Not found.',
		}
	}

	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/rss+xml',
		},
		body: data[0].rss,
	}
}
