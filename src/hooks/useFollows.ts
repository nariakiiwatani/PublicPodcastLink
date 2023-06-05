import { useState } from 'react'
import { fetch_podcast } from './usePodcast'

export type PodcastRecord = { url: string, title: string }

export const useFollows = () => {
	const [podcasts, setPodcasts] = useState<PodcastRecord[]>(JSON.parse(localStorage.getItem('podcasts') ?? '[]'));
	const add = async (url: string, title?: string) => {
		if(!title) {
			title = (await fetch_podcast(url))?.podcast.title
		}
		if(!title) {
			return false
		}
		const ret = [...podcasts]
		const found = ret.find(r=>r.url === url)
		if(found && found.title === title) {
			return false
		}
		if(found) {
			found.title = title
		}
		else {
			ret.push({url, title})
		}
		setPodcasts(ret)
	}
	const del = (url: string) => {
		const found = podcasts.find(r=>r.url === url)
		if(!found) {
			return false
		}
		setPodcasts(prev => prev.filter(p=>p.url !== url))
		return true
	}
	return { podcasts, add, del }
}