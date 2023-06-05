import { useState, useCallback, useEffect, createContext } from 'react'
import { fetch_podcast } from './usePodcast'

export type PodcastRecord = { url: string, title: string }

export const FollowingContext = createContext({
	podcasts: [] as PodcastRecord[],
	add: (_url: string):Promise<boolean>|boolean => false,
	del: (_url: string):Promise<boolean>|boolean => false,
	check: (_url: string):Promise<boolean>|boolean => false
})
export const FollowingProvider = ({children}:{children:React.ReactNode}) => {
	const value = useFollows()
	return <FollowingContext.Provider value={value}>{children}</FollowingContext.Provider>
}

export const useFollows = () => {
	const [podcasts, setPodcasts] = useState<PodcastRecord[]>(JSON.parse(localStorage.getItem('podcasts') ?? '[]'));
	useEffect(() => {
		localStorage.setItem('podcasts', JSON.stringify(podcasts))
	}, [podcasts])
	const add = useCallback(async (url: string) => {
		const title = (await fetch_podcast(url))?.podcast.title
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
		return true
	}, [podcasts])
	const del = useCallback((url: string) => {
		const found = podcasts.find(r=>r.url === url)
		if(!found) {
			return false
		}
		setPodcasts(prev => prev.filter(p=>p.url !== url))
		return true
	}, [podcasts])
	const check = useCallback((url: string) => {
		return podcasts.find(p=>p.url === url) !== undefined
	}, [podcasts])
	return { podcasts, add, del, check }
}