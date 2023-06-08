import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions"

const supabaseUrl = process.env.VITE_SUPABASE_API_URL!

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
	const [id] = event.path.split('/').slice(-2)
	return {
		statusCode: 302,
		headers: {
			Location: `${supabaseUrl}/storage/v1/object/public/playlist/thumbnail/${id}`
		},
	}
}
