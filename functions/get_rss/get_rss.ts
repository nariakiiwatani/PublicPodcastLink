import { Handler } from '@netlify/functions'
import fetch from 'node-fetch';

export const handler: Handler = async (event, context) => {
	const { url } = event.queryStringParameters as { url: string }
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
