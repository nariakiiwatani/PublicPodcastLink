import React, { useState, useEffect, FormEvent, createContext } from "react";
import { TextField, Button, List, ListItem } from "@mui/material";
import { useEpisodeSelect } from '../../hooks/useEpisodeSelect';
import { Podcast, Episode } from '../../types/podcast'
import { Playlist } from '.';
import { useContextPack } from '../../hooks/useContextPack';
import { ReorderableList } from '../ReorderList';

type PlaylistChannelEditorProps = {
	value: Podcast,
	onSubmit: (value: Podcast)=>void
}
const PlaylistChannelEditor = ({value, onSubmit}:PlaylistChannelEditorProps) => {
	const [title, setTitle] = useState(value.title)
	const [description, setDescription] = useState(value.description)
	const [link, setLink] = useState(value.link)

	useEffect(() => {
		setTitle(value.title);
		setDescription(value.description);
		setLink(value.link);
	}, [value])

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(e.target.value);
	}

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDescription(e.target.value);
	}

	const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLink(e.target.value);
	}

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault()
		onSubmit({
			...value,
			title,
			description,
			link
		})
	}
	return (
		<form onSubmit={handleSubmit}>
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
			<Button type='submit'>save</Button>
		</form>
	);
}

type SelectFromEpisodesProps = {
	onSelect: (episode: Episode) => void
}
const SelectFromEpisodes = ({onSelect}:SelectFromEpisodesProps) => {
	const {episodes, Input:SelectPodcast} = useEpisodeSelect()
	const {ArrayProviderConsumer} = useContextPack<Episode>(emptyEpisode)

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
		{item=><ListItem>
			{item.title}
		</ListItem>}
	</ReorderableList>
}

type PlaylistItemEditorProps = {
	value: Episode[]
}
const emptyEpisode = {
	id: '',
	title: '',
	description: '',
	link: '',
	audioUrl: '',
	type: '',
	imageUrl: '',
	pubDate: ''
}
const PlaylistItemEditor = ({value}:PlaylistItemEditorProps) => {
	const [items, setItems] = useState(value)
	const handleAddNewEpisode = (item: Episode):void => {
		setItems(prev=>[...prev, item])
	}
	return <>
		<SelectFromEpisodes onSelect={handleAddNewEpisode} />
		<ItemEdit items={items} onChange={setItems} />
	</>
}

type PlaylistEditorProps = {
	value: Playlist,
	onSave: (value: Podcast, episodes: Episode[]) => void
}
const PlaylistEditor = ({value, onSave}:PlaylistEditorProps) => {
	const [channel, setChannel] = useState(value.channel)
	const [items, setItems] = useState(value.items)
	const handleSave = () => {
		onSave(channel, items)
	}
	return <>
		<PlaylistChannelEditor value={channel} onSubmit={setChannel} />
		<PlaylistItemEditor value={items} />
	</>
};

export default PlaylistEditor;
