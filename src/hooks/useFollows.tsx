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

export const useFollows = () => {
	const { session } = useContext(SessionContext)
	const [podcasts, setPodcasts] = useState<PodcastRecord[]>(()=> {
		const value = JSON.parse(localStorage.getItem('podcasts') ?? '[]')
		if(value.length>0 && value[0].url) {
			return value.map((value:{url:string})=>value.url)
		}
		return value
	});
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
	useEffect(() => {
		if(session) {
			supabase.from('following').upsert({user_id:session.user.id, channels:podcasts})
		}
		else {
			localStorage.setItem('podcasts', JSON.stringify(podcasts))
		}
	}, [podcasts, session])
	const add = useCallback((url: string|string[]) => {
		let result = false
		setPodcasts(prev => {
			const new_url = (Array.isArray(url) ? url : [url]).filter(url=>!prev.includes(url))
			result = new_url.length > 0
			return result ? [...prev, ...new_url] : prev
		})
		return result
	}, [podcasts])
	const del = useCallback((url: string|string[]) => {
		let result = false
		setPodcasts(prev => {
			const new_url = prev.filter(current=>!(Array.isArray(url) ? url : [url]).includes(current))
			result = new_url.length === prev.length
			return result ? [...new_url] : prev
		})
		return true
	}, [podcasts])
	const check = useCallback((url: string) => {
		return podcasts.includes(url)
	}, [podcasts])

	const ToggleButton = useCallback(({url}:{
		url: string
	}) => {
		const props: ButtonProps = {
			variant: "text",
			size: "small",
			...(check(url) ? {
				color: "error",
				onClick: () => del(url)
			} : {
				color: "primary",
				onClick: () => add(url)
			})
		}
		return <Button
			{...props}
		>{check(url) ? 'unfollow' : 'follow'}</Button>
	}, [check, add, del])

	return { podcasts, add, del, check, ToggleButton }
}