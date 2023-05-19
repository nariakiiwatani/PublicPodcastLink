const base_url = window.origin
export const shareUrl = (rss_url: string, item_id?: string) => {
	return item_id
	? `${base_url}?channel=${encodeURIComponent(rss_url)}&item=${encodeURIComponent(item_id)}`
	: `${base_url}?channel=${encodeURIComponent(rss_url)}`
};