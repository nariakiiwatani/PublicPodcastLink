import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"
import { supabase } from '../../src/utils/supabase'

const isUUID = (str) => {
	const regex = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/;
	return regex.test(str);
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
	const [id] = event.path.split('/').slice(-2)

	const query = supabase.from('playlist').select('rss')
	const { data, error } = await (isUUID(id) ? query.eq('id', id) : query.eq('alias', id))

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
			'Content-Type': 'application/rss+xml; charset=utf-8'
		},
		body: data[0].rss
	}
}
