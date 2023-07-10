import { Handler } from '@netlify/functions'
import fetch from 'node-fetch';

const allowedOrigins = ["https://publicpodcast.link", "https://tweetpodcast.online"];

export const handler: Handler = async (event, context) => {
	const { url } = event.queryStringParameters as { url: string }
	if (!url) {
		return {
			statusCode: 400
		}
	}

	const headers = {
		"Access-Control-Allow-Headers": "Content-Type"
	};
	const origin = event.headers.origin;
	if (origin && allowedOrigins.includes(origin)) {
		headers['Access-Control-Allow-Origin'] = origin;
	}

	try {
		const res = await fetch(url)

		return {
			statusCode: res.status,
			body: await res.text(),
			headers
		}
	}
	catch(e) {
		return {
			statusCode: 500,
			body: e.message,
			headers
		}
	}
}
