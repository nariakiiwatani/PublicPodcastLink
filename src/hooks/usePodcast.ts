import { useState, useEffect } from 'react';
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
export const fetch_podcast = async (url: string):Promise<{
	podcast: Podcast,
	episodes: Episode[]
}|null> => {
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
					author: channel.author || '',
					self_url: url,
					owner: {
						email: channel['itunes:owner']?.['itunes:email'] || ''
					}
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

				return {podcast:newPodcast, episodes:newItems}
			}
		}
		return null;
	} catch (err) {
		throw err
	}
}

const usePodcast = (url?: string) => {

	const [value, setValue] = useState<{podcast:Podcast|null,episodes:Episode[]}>({
		podcast: null, episodes:[]
	})

	const fetchPodcast = async (url: string) => {
		return fetch_podcast(url)
		.then(result => {
			if(result) {
				setValue(result)
			}
			return result
		})
	};

	useEffect(() => {
		if(!url) return
		fetchPodcast(url)
	}, [url])

	const clearPodcast = () => {
		setValue({
			podcast:null,
			episodes:[]
		})
	}

	return { ...value, fetchPodcast, clearPodcast };
};

export default usePodcast;
