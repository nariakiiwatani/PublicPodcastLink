import { Handler } from '@netlify/functions'
import { supabase } from '../../src/utils/supabase'

export const handler: Handler = async (event, context) => {
	const { url } = event.queryStringParameters
	if (!url) {
		return {
			statusCode: 400
		}
	}
	try {
		const res = await fetch(url)

		return {
			statusCode: res.status,
			body: await res.text(),
		}
	}
	catch(e) {
		return {
			statusCode: 500,
			body: e.message
		}
	}
}
