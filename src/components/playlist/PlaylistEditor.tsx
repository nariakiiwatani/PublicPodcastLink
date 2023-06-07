import React, { useState, useEffect, useMemo, useRef, useImperativeHandle, useContext } from "react";
import { TextField, Button, List, ListItem, Grid } from "@mui/material";
import { useEpisodeSelect } from '../../hooks/useEpisodeSelect';
import { Podcast, Episode } from '../../types/podcast'
import { Playlist } from '.';
import { useContextPack } from '../../hooks/useContextPack';
import { ReorderableList } from '../ReorderList';
import { builder } from '../../utils/XmlParser';
import { Session } from '@supabase/supabase-js';
import { SessionContext } from '../../utils/supabase';

type PlaylistChannelEditorProps = {
	value: Podcast,
}
interface PlaylistChannelEditorRef {
	getValue: () => Podcast;
}
const PlaylistChannelEditor = React.forwardRef<PlaylistChannelEditorRef, PlaylistChannelEditorProps>(({value}, ref) => {
	const [title, setTitle] = useState(value.title)
	const [description, setDescription] = useState(value.description)
	const [link, setLink] = useState(value.link)

	useImperativeHandle(ref, () => ({
		getValue: () => ({
			...value,
			title,
			description,
			link
		}),
	}))

	useEffect(() => {
		setTitle(value.title)
		setDescription(value.description)
		setLink(value.link)
	}, [value])

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value)
	}

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDescription(e.target.value)
	}

	const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLink(e.target.value)
	}

	return (<>
		<TextField
			label="Title"
			value={title}
			onChange={handleTitleChange}
		/>

		<TextField
			label="Description"
			value={description}
			onChange={handleDescriptionChange}
		/>

		<TextField
			label="Link"
			value={link}
			onChange={handleLinkChange}
		/>
	</>)
})

type SelectFromEpisodesProps = {
	onSelect: (episode: Episode) => void
}
const SelectFromEpisodes = ({onSelect}:SelectFromEpisodesProps) => {
	const {episodes, Input:SelectPodcast} = useEpisodeSelect()
	const {ArrayProviderConsumer} = useContextPack<Episode>()

	return (<>
		<SelectPodcast />
		<List>
			<ArrayProviderConsumer value={episodes}>
				{(value) => <ListItem onClick={()=>onSelect(value)}>{value.title}</ListItem>}
			</ArrayProviderConsumer>
		</List>
	</>)
}

type ItemEditProps = {
	items: Episode[],
	onChange: (items:Episode[]) => void
}
const ItemEdit = ({items, onChange}:ItemEditProps) => {
	return <ReorderableList items={items} onChange={onChange}>
		{item => 
			<ListItem>
				{item.title}
			</ListItem>
		}
	</ReorderableList>
}

type PlaylistItemEditorProps = {
	value: Episode[]
}
type PlaylistItemEditorRef = {
	getValue: () => Episode[]
}
const PlaylistItemEditor = React.forwardRef<PlaylistItemEditorRef, PlaylistItemEditorProps>(({value}, ref) => {
	const [items, setItems] = useState(value)
	useImperativeHandle(ref, () => ({
		getValue: () => items,
	}))
	const handleAddNewEpisode = (item: Episode):void => {
		setItems(prev=>[...prev, item])
	}
	return <Grid container spacing={2}>
		<Grid item xs={6}>
			<ItemEdit items={items} onChange={setItems} />
		</Grid>
		<Grid item xs={6}>
			<SelectFromEpisodes onSelect={handleAddNewEpisode} />
		</Grid>
	</Grid>
})

const CDATA = (unsafe: string) => {
	const result = `<![CDATA[${unsafe.replaceAll(']]>', ']]><![CDATA[')}]]>`
	return result
}

const ESCAPE = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c: string) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
			case '©': return '&#xA9;';
			case '℗': return '&#x2117;';
			case '™': return '&#x2122;';
        }
		return c
    });
}
const create_xml = (podcast: Podcast, episodes: Episode[], id: string, session: Session) => {
	const link = `${window.origin}/playlist/${id}`
	const rss_url = `${link}/rss`
	const author = session.user.id
	const email = session.user.email
	const image_url = `${window.origin}/playlist/${id}/thumbnail`
	if(!email) {
		throw new Error('email not set')
	}
	const channel = {
		title: {
			__cdata: podcast.title
		},
		description: {
			__cdata: podcast.description
		},
		link,
		image: {
			url: image_url,
			title: podcast.title,
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
		'itunes:summary': podcast.description,
		'itunes:type': 'episodic',
		'itunes:owner': {
			'itunes:name': author,
			'itunes:email': email
		},
		'itunes:image': {
			'@href': image_url
		},
		item: episodes.map(({src})=>src)
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
type PlaylistEditorProps = {
	value: Playlist,
	onSave: (value: Podcast, episodes: Episode[]) => void
}
const PlaylistEditor = ({value, onSave}:PlaylistEditorProps) => {
	const {session} = useContext(SessionContext)
	const [channel, setChannel] = useState(value.channel)
	const [items, setItems] = useState(value.items)
	useEffect(() => {
		setChannel(value.channel)
		setItems(value.items)
	}, [value])
	const rss = useMemo(() => {
		if(!session) throw new Error('not logged in')
		const result = create_xml(channel, items, 'test_id', session)
		navigator.clipboard.writeText(result);
		return result
	}, [channel, items])
	const channel_ref = useRef<PlaylistChannelEditorRef>(null)
	const item_ref = useRef<PlaylistItemEditorRef>(null)
	const handleSave = () => {
		if(!channel_ref.current || !item_ref.current) return
		onSave(channel_ref.current.getValue(), item_ref.current.getValue())
	}
	return <>
		<PlaylistChannelEditor
			ref={channel_ref}
			value={channel}
		/>
		<PlaylistItemEditor
			ref={item_ref}
			value={items}
		/>
		<Button onClick={handleSave}>save</Button>
		<div>{rss}</div>
	</>
};

export default PlaylistEditor;
