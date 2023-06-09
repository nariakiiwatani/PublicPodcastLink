import { useContext, useState, useMemo, useEffect, FormEvent, useRef } from 'react'
import { Episode } from '../../types/podcast'
import { SessionContext, supabase } from '../../utils/supabase'
import { Database } from '../../types/supabase_database'
import { v4 as uuidv4 } from 'uuid'
import { fetch_podcast } from '../../hooks/usePodcast'
import { builder } from '../../utils/XmlParser'
import { User } from '@supabase/supabase-js'
import { FollowingProvider } from '../../hooks/useFollows'
import PlaylistSelection from './PlaylistSelection'
import { Grid, Divider, Button, Typography, Box, CircularProgress } from '@mui/material'
import { useDialog } from '../../hooks/useDialog'
import { PlaylistChannelEditorRef, PlaylistItemEditorRef, PlaylistChannelEditor, PlaylistItemEditor } from './PlaylistEditor'
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import { TabPanel } from '../TabPanel'
import { EditableChannelContext, SharedMembersEditor } from '../../Owner'
import { RelatedLinksProvider, RelatedLinksEditor } from '../../hooks/useRelatedLinks'
import PodcastPreview from '../PodcastPreview'

export const playlist_base_url = `${window.origin}/playlist`
export const playlist_view_url = (name: string) => `${playlist_base_url}/${name}/view`
export const playlist_rss_url = (name: string) => `${playlist_base_url}/${name}/rss`
export const playlist_thumbnail_url = (name: string) => `${playlist_base_url}/${name}/thumbnail`
export const playlist_thumbnail_default_url = `${window.origin}/playlist-default-thumbnail.png`

export type Playlist = {
	is_new?: boolean,
	id: string,
	alias: string,
	title: string,
	description: string,
	author: string,
	thumbnail: File | string,
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
	if (!email) {
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
		item: playlist.items.map(({ src }) => src)
	}
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
>
	${builder({ cdataPropName: '__cdata' }).build({
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
	const { session } = useContext(SessionContext)
	const user_id = useMemo(() => session?.user.id, [session])
	const [value, setValue] = useState<Record['Row'][]>([])
	const refresh = async () => {
		const new_value = (await supabase.from('playlist').select('*').match({ created_by: user_id })).data
		if (!new_value) return
		setValue(new_value)
	}
	const update = (id: string, record: Record['Insert']) => supabase.from('playlist').upsert({ id, ...record }).match({ id }).throwOnError().then(refresh)
	const del = async (id: string) => {
		await supabase.from('playlist').delete().match({ id }).throwOnError().then(refresh)
		await supabase.storage.from('playlist').remove([`thumbnail/${id}`])
	}
	const upload = (file: File, filename: string) => {
		const filepath = `thumbnail/${filename}`
		return supabase.storage.from('playlist').upload(filepath, file).then(({ data }) => data?.path)
	}
	useEffect(() => {
		refresh()
	}, [])
	return {
		value, update, refresh, del, upload
	}
}

export default () => {
	const db = useDB()
	const { session } = useContext(SessionContext)
	const [value, setValue] = useState<Playlist>(() => make_empty_playlist())
	const channel_ref = useRef<PlaylistChannelEditorRef>(null)
	const item_ref = useRef<PlaylistItemEditorRef>(null)
	const [submitStatus, setSubmitStatus] = useState<'success' | 'pending' | 'fail' | 'neutral'>('neutral')
	const handleSelect = (id: string) => {
		const playlist = db.value.find(v => v.id === id)
		if (!playlist) return
		const url = playlist_rss_url(playlist.alias)
		fetch_podcast(url, true).then(result => {
			if (!result) return
			setSubmitStatus('neutral')
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
		setSubmitStatus('neutral')
	}
	const unique_id_of_this_playlist = useMemo(() => playlist_rss_url(value.id), [value])

	const handleSave = async (e: FormEvent) => {
		e.preventDefault()
		if (!session?.user) throw new Error('not logged in');
		if (!channel_ref.current || !item_ref.current) return
		const value: Playlist = {
			...channel_ref.current.getValue(),
			items: item_ref.current.getValue()
		}
		try {
			setSubmitStatus('pending')
			if (value.thumbnail && value.thumbnail instanceof File) {
				await db.upload(value.thumbnail, value.id)
			}
			await db.update(
				value.id, {
				alias: value.alias,
				channel: unique_id_of_this_playlist,
				rss: create_xml(value, session.user)
			}
			)
			setValue({
				...value,
				is_new: false
			})
			setSubmitStatus('success')
		}
		catch (e) {
			setSubmitStatus('fail')
		}
	}
	const deleteDialog = useDialog()
	const handleDelete = (id: string) => {
		deleteDialog.close()
		db.del(id).then(() => handleNew())
	}

	useEffect(() => {
		if (submitStatus !== 'neutral') {
			const timerId = setTimeout(() => setSubmitStatus('neutral'), 2000);
			return () => clearTimeout(timerId);
		}
	}, [submitStatus]);
	const SubmitStatus = ({ status }: { status: string }) =>
		status === 'success' ? <DoneIcon color='success' /> :
			status === 'fail' ? <ErrorIcon color='error' /> :
				status === 'pending' ? <CircularProgress /> :
					<></>
	const Tabs = {
		'playlist':
			useMemo(() => (<Grid item xs={12}>
				<form onSubmit={handleSave}>
					<PlaylistChannelEditor
						ref={channel_ref}
						value={value}
					/>
					<Divider variant='fullWidth' sx={{ marginTop: 2, marginBottom: 2 }} />
					<FollowingProvider>
						<PlaylistItemEditor
							ref={item_ref}
							value={value.items}
						/>
					</FollowingProvider>
					<Button type='submit' variant='contained'>{value.is_new ? '公開' : '更新'}</Button>
					<SubmitStatus status={submitStatus} />
				</form>
			</Grid>), [handleSave, channel_ref.current, value, item_ref.current, submitStatus]),
		'co_editor': useMemo(() => (<SharedMembersEditor url={unique_id_of_this_playlist} />), [unique_id_of_this_playlist]),
		'related_link': 
			useMemo(() => (
				<RelatedLinksProvider url={unique_id_of_this_playlist}>
					<RelatedLinksEditor />
				</RelatedLinksProvider>
			), [unique_id_of_this_playlist]),
		'delete':
			useMemo(() => (<Box>
				<Box sx={{ backgroundColor: 'darkgrey', padding: 2, marginTop: 4 }}>
					<Typography variant='h2' color='error'>プレイリストを削除</Typography>
					<Button
						color='error'
						variant='outlined'
						onClick={() => deleteDialog.open()}
					>DELETE</Button>
				</Box>
				<deleteDialog.Dialog title='本当に削除しますか？'>
					<Typography variant='h4'>この操作は取り消せません</Typography>
					<Button
						color='error'
						variant='contained'
						onClick={() => handleDelete(value.id)}
					>削除する</Button>
					<Button
						color='primary'
						variant='outlined'
						onClick={() => deleteDialog.close()}
					>やめとく</Button>
				</deleteDialog.Dialog>
			</Box>), [handleDelete, deleteDialog])
	}
	const { owned } = useContext(EditableChannelContext)

	const is_owned = useMemo(() => value && owned && owned.includes(unique_id_of_this_playlist), [value, owned])

	const tab_used = useMemo<(keyof typeof Tabs)[]>(() => {
		const ret: (keyof typeof Tabs)[] = []
		if(value) ret.push('playlist')
		if(!value.is_new) {
			ret.push('related_link')
			if(is_owned) ret.push('co_editor', 'delete')
		}
		return ret
	}, [value])
	return (<>
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<PlaylistSelection playlists={db.value} value={value.is_new ? undefined : value.id} onSelect={handleSelect} onNew={handleNew} />
			</Grid>
			<Grid item xs={12}>
			<TabPanel labels={tab_used.map(name=><>{name}</>)}>
				{tab_used.map(name=><Box key={name}>{Tabs[name]}</Box>)}
			</TabPanel>
			</Grid>
		</Grid>
	</>)
}