import React, { useState, useEffect, useRef, useMemo, useImperativeHandle, FormEvent } from "react";
import { TextField, List, ListItem, Grid, Button } from "@mui/material";
import { useEpisodeSelect } from '../../hooks/useEpisodeSelect';
import { Episode } from '../../types/podcast'
import { Playlist } from './Playlist';
import { useContextPack } from '../../hooks/useContextPack';
import { ReorderableList } from '../ReorderList';

type PlaylistChannelEditorProps = {
	value: Playlist,
}
interface PlaylistChannelEditorRef {
	getValue: () => Playlist;
}
const PlaylistChannelEditor = React.forwardRef<PlaylistChannelEditorRef, PlaylistChannelEditorProps>(({value}, ref) => {
	const [alias, setAlias] = useState(value.alias)
	const [title, setTitle] = useState(value.channel.title)
	const [description, setDescription] = useState(value.channel.description)
	const [thumbnail, setThumbnail] = useState<File|undefined>()

	useImperativeHandle(ref, () => ({
		getValue: () => ({
			...value,
			alias,
			thumbnail,
			channel: {
				...value.channel,
				title,
				description,
			}
		}),
	}))

	useEffect(() => {
		setAlias(value.alias)
		setTitle(value.channel.title)
		setDescription(value.channel.description)
		setThumbnail(value.thumbnail)
	}, [value])

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value)
	}

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDescription(e.target.value)
	}

	const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAlias(e.target.value)
	}
	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if(file) {
			setThumbnail(file)
		}
	}
	const thumbnail_url = useMemo(() => thumbnail?URL.createObjectURL(thumbnail):null, [thumbnail])

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
			label="Alias"
			value={alias}
			onChange={handleAliasChange}
		/>
		<input
			accept="image/*"
			style={{ display: "none" }}
			id="button-file"
			type="file"
			onChange={handleThumbnailChange}
		/>
		<label htmlFor="button-file">
			<Button variant="contained" component="span">
				Upload
			</Button>
		</label>
		{thumbnail_url && <img src={thumbnail_url} />}
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

type PlaylistEditorProps = {
	value: Playlist,
	onSave: (value: Playlist) => void
}
const PlaylistEditor = ({value, onSave}:PlaylistEditorProps) => {
	const channel_ref = useRef<PlaylistChannelEditorRef>(null)
	const item_ref = useRef<PlaylistItemEditorRef>(null)
	const handleSave = (e: FormEvent) => {
		e.preventDefault()
		if(!channel_ref.current || !item_ref.current) return
		onSave({
			...channel_ref.current.getValue(),
			items: item_ref.current.getValue()
		})
	}
	return <form onSubmit={handleSave}>
		<PlaylistChannelEditor
			ref={channel_ref}
			value={value}
		/>
		<PlaylistItemEditor
			ref={item_ref}
			value={value.items}
		/>
		<Button type='submit'>save</Button>
	</form>
};

export default PlaylistEditor;
