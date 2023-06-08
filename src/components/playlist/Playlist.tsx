import { useContext, useState, useMemo, useEffect } from 'react'
import { Episode } from '../../types/podcast'
import { SessionContext, supabase } from '../../utils/supabase'
import { Database } from '../../types/supabase_database'
import { v4 as uuidv4 } from 'uuid'
import { fetch_podcast } from '../../hooks/usePodcast'
import { builder } from '../../utils/XmlParser'
import { User } from '@supabase/supabase-js'
import { FollowingProvider } from '../../hooks/useFollows'
import PlaylistEditor from './PlaylistEditor'
import PlaylistSelection from './PlaylistSelection'
import { Grid, Divider } from '@mui/material'

export const playlist_base_url = `${window.origin}/playlist`
export const playlist_view_url = (name:string)=>`${playlist_base_url}/${name}/view`
export const playlist_rss_url = (name:string)=>`${playlist_base_url}/${name}/rss`
export const playlist_thumbnail_url = (name:string)=>`${playlist_base_url}/${name}/thumbnail`
export const playlist_thumbnail_default_url = `${window.origin}/playlist-default-thumbnail.png`

export type Playlist = {
	is_new?:boolean,
	id: string,
	alias: string,
	title: string,
	description: string,
	author: string,
	thumbnail: File|string,
	items: Episode[]
}

const create_xml = (playlist: Playlist, user: User) => {
	const { id, alias, title, description, author } = playlist
	const link = playlist_view_url(alias)
	const rss_url = playlist_rss_url(alias)
	const image_url = playlist.thumbnail instanceof File
		? playlist_thumbnail_url(id)
		: playlist.thumbnail
	const email = user.email
	if(!email) {
		throw new Error('email not set')
	}
	const channel = {
		title: {
			__cdata: title
		},
		description: {
			__cdata: description
		},
		link,
		image: {
			url: image_url,
			title: title,
			link
		},
		author,
		generator: 'PublicPodcastLink Playlist Creator',
		lastBuildDate: new Date().toUTCString(),
		'atom:link': {
			'@href': rss_url,
			'@rel': 'self',
			'@type': 'application/rss+xml'
		},
		'itunes:author': author,
		'itunes:summary': description,
		'itunes:type': 'episodic',
		'itunes:owner': {
			'itunes:name': author,
			'itunes:email': email
		},
		'itunes:image': {
			'@href': image_url
		},
		item: playlist.items.map(({src})=>src)
	}
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
>
	${builder({cdataPropName:'__cdata'}).build({
		channel
	})}
</rss>`
}

const make_empty_playlist = (): Playlist => {
	return {
		is_new: true,
		id: uuidv4(),
		alias: '',
		title: '',
		description: '',
		author: '',
		thumbnail: playlist_thumbnail_default_url,
		items: []
	}
}

type Record = Database['public']['Tables']['playlist']
const useDB = () => {
	const {session} = useContext(SessionContext)
	const user_id = useMemo(() => session?.user.id, [session])
	const [value, setValue] = useState<Record['Row'][]>([])
	const refresh = async () => {
		const new_value = (await supabase.from('playlist').select('*').match({created_by:user_id})).data
		if(!new_value) return
		setValue(new_value)
	}
	const update = (id: string, record: Record['Insert']) => supabase.from('playlist').upsert({id, ...record}).match({id}).then(refresh)
	const del = (id: string) => supabase.from('playlist').delete().match({id}).then(refresh)
	useEffect(() => {
		refresh()
	},[])
	return {
		value, update, refresh, del
	}
}
const useBucket = (bucket_name: string) => {
	const upload = (file: File, filename: string) => {
		const filepath = `thumbnail/${filename}`
		return supabase.storage.from(bucket_name).upload(filepath, file)
		.then(({data}) => data?.path)
	}
	return { upload }
}

export default () => {
	const db = useDB()
	const bucket = useBucket('playlist')
	const {session} = useContext(SessionContext)
	const [value, setValue] = useState<Playlist>(() => make_empty_playlist())
	const handleSelect = (id: string) => {
		const playlist = db.value.find(v=>v.id === id)
		if(!playlist) return
		const url = playlist_rss_url(playlist.alias)
		fetch_podcast(url, true).then(result => {
			if(!result) return
			setValue({
				is_new: false,
				id, alias: playlist.alias,
				title: result.podcast.title,
				description: result.podcast.description,
				author: result.podcast.author,
				thumbnail: result.podcast.imageUrl,
				items: result.episodes
			})
		})
	}
	const handleNew = () => {
		setValue(make_empty_playlist())
	}
	const handleSave = (value: Playlist) => {
		if(!session?.user) throw new Error('not logged in');
		((value.thumbnail && value.thumbnail instanceof File) ? bucket.upload(value.thumbnail, value.id) : Promise.resolve())
		.then(() => 
			db.update(
				value.id, {
					alias: value.alias,
					rss: create_xml(value, session.user)
				}
			)
			.then(() => {
				setValue({
					...value,
					is_new: false
				})
			})
		)
	}
	return <>
		<FollowingProvider>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<PlaylistSelection playlists={db.value} value={value.is_new?undefined:value.id} onSelect={handleSelect} onNew={handleNew} />
				</Grid>
				<Divider variant='fullWidth' />
				<Grid item xs={12}>
					<PlaylistEditor value={value} onSave={handleSave} />
				</Grid>
			</Grid>
		</FollowingProvider>
	</>
}