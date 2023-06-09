export const permalink = (rss_url: string, option: {
	item_id?: string,
	base_url?: string
}={}) => {
	const {item_id, base_url=window.origin} = option
	let ret = `${base_url}?channel=${encodeURIComponent(rss_url)}`
	if(item_id) ret += `&item=${encodeURIComponent(item_id)}`
	return ret
};

export const importlink = (channels: string[], option: {
	base_url?:string
}={}) => {
	const {base_url=window.origin} = option
	return `${base_url}?channels=${channels.map(encodeURIComponent).join(',')}`
}