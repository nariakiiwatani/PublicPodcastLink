import React, { useState, useCallback, useEffect, useContext, createContext } from 'react'
import { Button, ButtonProps } from '@mui/material'
import { SessionContext, supabase } from '../utils/supabase'

export type PodcastRecord = string

export const FollowingContext = createContext({
	podcasts: [] as PodcastRecord[],
	add: (_url: string|string[]):Promise<boolean>|boolean => false,
	del: (_url: string|string[]):Promise<boolean>|boolean => false,
	check: (_url: string):Promise<boolean>|boolean => false,
	ToggleButton: ({url:_}:{url:string}): React.ReactElement => <></>
})
export const FollowingProvider = ({children}:{children:React.ReactNode}) => {
	const value = useFollows()
	return <FollowingContext.Provider value={value}>{children}</FollowingContext.Provider>
}

const setDB = (user_id: string, channels: string[]) => {
	return supabase.from('following').upsert({user_id, channels})
}
const setStorage = (channels: string[]) => {
	localStorage.setItem('podcasts', JSON.stringify(channels))
}

export const useFollows = () => {
	const { session } = useContext(SessionContext)
	const [podcasts, setPodcasts] = useState<PodcastRecord[]>(()=> {
		const value = JSON.parse(localStorage.getItem('podcasts') ?? '[]')
		if(value.length>0 && value[0].url) {	// old format to new format
			return value.map((value:{url:string})=>value.url)
		}
		return value
	});
	const update = useCallback(async (channels: string[]) => {
		if(session) {
			await setDB(session.user.id, channels)
		}
		else {
			setStorage(channels)
		}
	},[session])
	useEffect(() => {
		if(!session) return
		const query = supabase.from('following').select('channels')
		query.then(result => {
			if(result.error) return
			if(!result?.data || result.data.length === 0) {
				supabase.from('following').upsert({user_id:session.user.id, channels:podcasts})
			}
			else {
				setPodcasts(result.data.flatMap(data=>data.channels))
			}
		})
	}, [session])
	const add = useCallback((url: string|string[]) => {
		let result = false
		setPodcasts(prev => {
			const new_url = (Array.isArray(url) ? url : [url]).filter(url=>!prev.includes(url))
			result = new_url.length > 0
			if(!result) {
				return prev
			}
			const new_array = result ? [...prev, ...new_url] : prev
			update(new_array)
			return new_array
		})
		return result
	}, [podcasts, update])
	const del = useCallback((url: string|string[]) => {
		let result = false
		setPodcasts(prev => {
			const new_url = prev.filter(current=>!(Array.isArray(url) ? url : [url]).includes(current))
			result = new_url.length !== prev.length
			if(!result) {
				return prev
			}
			const new_array = result ? [...new_url] : prev
			update(new_array)
			return new_array
		})
		return true
	}, [podcasts, update])
	const check = useCallback((url: string) => {
		return podcasts.includes(url)
	}, [podcasts])

	const ToggleButton = useCallback(({url}:{
		url: string
	}) => {
		const is_following = check(url)
		const props: ButtonProps = {
			variant: "text",
			size: "small",
			...(is_following ? {
				color: "error",
				onClick: () => del(url)
			} : {
				color: "primary",
				onClick: () => add(url)
			})
		}
		return <Button
			{...props}
		>{is_following ? 'unfollow' : 'follow'}</Button>
	}, [check, add, del])

	return { podcasts, add, del, check, ToggleButton }
}