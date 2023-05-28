import { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';
import { Podcast, Episode } from '../types/podcast';

const parser = new XMLParser({
	attributeNamePrefix: "",
	ignoreAttributes: false
})

const fetch_via_api = (url: string) => {
	const new_url = `${import.meta.env.VITE_API_PATH}/get_rss?url=${encodeURIComponent(url)}`
	return fetch(new_url)
}
const usePodcast = () => {
	const [podcast, setPodcast] = useState<Podcast | null>(null);
	const [episodes, setEpisodes] = useState<Episode[]>([]);

	const fetchPodcast = async (url: string) => {
		try {
			const rss_string = await (await fetch_via_api(url)).text()
			const rss = parser.parse(rss_string).rss;
			if (rss) {
				const { channel } = rss
				if (channel) {
					const newPodcast = {
						title: channel.title,
						description: channel.description,
						imageUrl: channel.image?.url || '',
						link: channel.link,
						author: channel.author || ''
					};

					const items = channel?.item ? Array.isArray(channel.item) ? channel.item : [channel.item] : []
					const newItems = items.map((item: any) => ({
						id: item.guid?.['#text'] || '',
						title: item.title || '',
						description: item.description || '',
						link: item.link || '',
						audioUrl: item.enclosure?.url || '',
						imageUrl: item['itunes:image']?.href || '',
						pubDate: item.pubDate || '',
						type: item.enclosure?.type || ''
					}))

					setPodcast(newPodcast);
					setEpisodes(newItems);

					return {podcast:newPodcast, episodes:newItems}
				}
			}
			return null;
		} catch (err) {
			console.error(err);
			// TODO: Improve error handling
			return null;
		}
	};

	const clearPodcast = () => {
		setPodcast(null)
		setEpisodes([])
	}

	return { podcast, episodes, fetchPodcast, clearPodcast };
};

export default usePodcast;
