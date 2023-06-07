import { useContext, useState, useMemo } from 'react'
import { Podcast, Episode } from '../../types/podcast'
import { SessionContext, supabase } from '../../utils/supabase'
import { Database } from '../../types/supabase_database'
import { v4 as uuidv4 } from 'uuid'
import { fetch_podcast } from '../../hooks/usePodcast'
import { builder } from '../../utils/XmlParser'
import { User } from '@supabase/supabase-js'
import { FollowingProvider } from '../../hooks/useFollows'
import PlaylistEditor from './PlaylistEditor'
import PlaylistSelection from './PlaylistSelection'

export const playlist_url = (id:string)=>`${window.origin}/playlist/${id}/view`
export const playlist_rss_url = (id:string)=>`${window.origin}/playlist/${id}/rss`
export const playlist_thumbnail_url = (id:string)=>`${window.origin}/playlist/${id}/thumbnail`

export type Playlist = {
	id: string,
	alias: string,
	channel: Podcast,
	items: Episode[]
}

const create_xml = (playlist: Playlist, user: User) => {
	const link = playlist_url(playlist.alias)
	const rss_url = playlist_rss_url(playlist.alias)
	const image_url = playlist_thumbnail_url(playlist.alias)
	const author = user.id
	const email = user.email
	const title = playlist.channel.title
	const description = playlist.channel.description
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
		id: uuidv4(),
		alias: '',
		channel: {
			title: '',
			description: '',
			link: '',
			imageUrl: '',
			author: '',
			self_url: '',
			owner: {
				email: ''
			}
		},
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
	const update = (id: string, record: Record['Insert']) => {
		supabase.from('playlist').upsert({id, ...record}).match({id}).then(refresh)
	}
	const del = (id: string) => {
		supabase.from('playlist').delete().match({id}).then(refresh)
	}
	return {
		value, update, refresh, del
	}
}

export default () => {
	const db = useDB()
	const {session} = useContext(SessionContext)
	const [value, setValue] = useState<Playlist>(() => make_empty_playlist())
	const handleSelect = (id: string) => {
		const playlist = db.value.find(v=>v.id === id)
		if(!playlist) return
		const url = playlist_rss_url(id)
		fetch_podcast(url).then(result => {
			if(!result) return
			setValue({
				id, alias: playlist.alias,
				channel: result.podcast,
				items: result.episodes
			})
		})
	}
	const handleNew = () => {
		setValue(make_empty_playlist())
	}
	const handleSave = (value: Playlist) => {
		if(!session?.user) throw new Error('not logged in')
		db.update(
			value.id, {
				alias: value.alias,
				rss: create_xml(value, session.user)
			}
		)
		setValue(value)
	}
	return <>
		<FollowingProvider>
			<PlaylistSelection playlists={db.value} onSelect={handleSelect} onNew={handleNew} />
			<PlaylistEditor value={value} onSave={handleSave} />
		</FollowingProvider>
	</>
}