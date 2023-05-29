import { Handler, HandlerEvent } from '@netlify/functions'
import { supabase } from '../../src/utils/supabase'

export const handler: Handler = async (event : HandlerEvent, context) => {
	const { key, channel } = event.queryStringParameters as {key?:string,channel?:string}
	if (!key || !channel) {
		return {
			statusCode: 400
		}
	}
	try {
		const valid = await supabase.from('check_owner')
		.select('id, channel')
		.match({id:key,channel})
		.single()
		if(valid.error) {
			return {
				statusCode:  406
			}
		}
		return {
			statusCode: 200
		}
	}
	catch(e) {
		return {
			statusCode: 500,
			body: e.message
		}
	}
}
