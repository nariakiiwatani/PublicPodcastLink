const base_url = 'https://nariakiiwatani.github.io/InstantPodcastPlayer'
export const shareUrl = (rss_url: string, item_id?: string) => {
	return item_id
	? `${base_url}/${encodeURIComponent(rss_url)}/${encodeURIComponent(item_id)}/`
	: `${base_url}/${encodeURIComponent(rss_url)}/`
};