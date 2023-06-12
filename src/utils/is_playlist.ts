export const is_playlist_url = (url:string): [boolean, string|null]=> {
	const match = url.match(/\/playlist\/([^/]+)\/rss/)
	if(match) {
		return [true, match[1]]
	}
	return [false, null]
}
