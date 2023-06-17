import { useState, useEffect } from 'react';
import { Podcast, Episode } from '../types/podcast';
import { parser } from '../utils/XmlParser';

const fetch_via_api = (url: string) => {
	const new_url = `${window.origin}${import.meta.env.VITE_API_PATH}/get_rss?url=${encodeURIComponent(url)}`
	return fetch(new_url)
}
const rss_cache:{[url:string]:any} = {}
export const fetch_podcast = async (url: string, reload?:boolean):Promise<{
	podcast: Podcast,
	episodes: Episode[],
}|null> => {
	const p = parser()
	try {
		const rss = await (async () => {
			if(!reload && url in rss_cache) return rss_cache[url]
			rss_cache[url] = fetch_via_api(url).then(result=>result.text()).then(result=>p.parse(result).rss);
			return rss_cache[url]
		})()
		if (rss) {
			const { channel } = rss
			if (channel) {
				const newPodcast = {
					title: channel.title,
					description: channel.description,
					imageUrl: channel.image?.url || '',
					link: channel.link,
					author: channel.author || '',
					self_url: channel['atom:link']?.['@href']??url,
					owner: {
						email: channel['itunes:owner']?.['itunes:email'] || ''
					},
					src: channel
				};

				const items = channel?.item ? Array.isArray(channel.item) ? channel.item : [channel.item] : []
				const newItems = items.map((item: any) => ({
					id: item.guid?.['#text'] || '',
					title: item.title || '',
					description: item.description || '',
					link: item.link || '',
					mediaUrl: item.enclosure?.['@url'] || '',
					imageUrl: item['itunes:image']?.['@href'] || '',
					pubDate: item.pubDate || '',
					type: item.enclosure?.['@type'] || '',
					src: item
				}))

				return {podcast:newPodcast, episodes:newItems}
			}
		}
		return null;
	} catch (err) {
		throw err
	}
}

type usePodcastOptions = {
	order_by?: 'listed'|'date_asc'|'date_desc'
}

const usePodcast = (url?: string, {
	order_by
}:usePodcastOptions = {
	order_by: 'listed'
}) => {

	const [value, setValue] = useState<{podcast:Podcast|null,episodes:Episode[]}>({
		podcast: null, episodes:[]
	})
	const [ordered_episodes, setOrderedEpisodes] = useState<Episode[]>([])

	const fetchPodcast = async (url: string) => {
		setValue({podcast:null,episodes:[]})
		return fetch_podcast(url)
		.then(result => {
			if(result) {
				setValue(result)
			}
			return result
		})
	}

	useEffect(() => {
		if(!url) return
		fetchPodcast(url)
	}, [url])

	useEffect(() => {
		const episodes = [...value.episodes]
		switch(order_by) {
			case 'date_asc':
				episodes.sort((a,b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime())
				break;
			case 'date_desc':
				episodes.sort((a,b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
				break;
			case 'listed':
				break;
		}
		setOrderedEpisodes(episodes)
	}, [order_by, value.episodes])

	const clearPodcast = () => {
		setValue({
			podcast:null,
			episodes:[]
		})
	}

	return {
		podcast: value.podcast,
		episodes: ordered_episodes,
		fetchPodcast,
		clearPodcast
	};
};

export default usePodcast;
