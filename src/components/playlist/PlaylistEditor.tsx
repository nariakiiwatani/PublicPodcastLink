import React, { useState, useEffect, useRef, useMemo, useCallback, useImperativeHandle, FormEvent } from "react";
import { TextField, ListItem, Grid, Button, Typography, Box, Card, Divider, IconButton } from "@mui/material";
import { useEpisodeSelect } from '../../hooks/useEpisodeSelect';
import { Episode } from '../../types/podcast'
import { Playlist, playlist_base_url } from './Playlist';
import { ReorderableList, useReorder } from '../ReorderList';
import DeleteIcon from '@mui/icons-material/Delete'

type PlaylistChannelEditorProps = {
	value: Playlist,
}
interface PlaylistChannelEditorRef {
	getValue: () => Playlist;
}
const PlaylistChannelEditor = React.forwardRef<PlaylistChannelEditorRef, PlaylistChannelEditorProps>(({ value }, ref) => {
	const [alias, setAlias] = useState(value.alias)
	const [title, setTitle] = useState(value.title)
	const [author, setAuthor] = useState(value.author)
	const [description, setDescription] = useState(value.description)
	const [thumbnail, setThumbnail] = useState<File | string>(value.thumbnail)

	useImperativeHandle(ref, () => ({
		getValue: () => ({
			...value,
			alias,
			title,
			author,
			description,
			thumbnail,
		}),
	}))

	useEffect(() => {
		setAlias(value.alias)
		setTitle(value.title)
		setAuthor(value.author)
		setDescription(value.description)
		setThumbnail(value.thumbnail)
	}, [value])

	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setThumbnail(file)
		}
	}
	const thumbnail_url = useMemo(() => thumbnail instanceof File ? URL.createObjectURL(thumbnail) : thumbnail, [thumbnail])

	return (<>
		<Grid container spacing={2} sx={{ marginTop: 2 }}>
			<Grid item xs={12} md={6} container alignContent='start' spacing={2} >
				<Grid item xs={12}>
					<Typography variant='h4'>タイトル</Typography>
					<TextField
						fullWidth
						variant='outlined'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h4'>説明</Typography>
					<TextField
						fullWidth
						variant='outlined'
						value={description}
						rows={5}
						multiline
						onChange={(e) => setDescription(e.target.value)}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h4'>作成者名</Typography>
					<TextField
						fullWidth
						variant='outlined'
						value={author}
						onChange={(e) => setAuthor(e.target.value)}
					/>
				</Grid>
			</Grid>
			<Grid item xs={12} md={6} container spacing={2}>
				<Grid item xs={12}>
					<Typography variant='h4'>RSS Feed URL</Typography>
					<Box sx={{ display: 'flex', alignItems: 'end' }}>
						<Typography variant='body2'>
							{playlist_base_url}
						</Typography>
						<TextField
							size='small'
							variant='outlined'
							value={alias}
							onChange={(e) => setAlias(e.target.value)}
						/>
						<Typography variant='body2'>
							/rss
						</Typography>
					</Box>
				</Grid>
				<Grid item xs={6}>
					<Typography variant='h4'>サムネイル（クリックしてアップロード）</Typography>
					<input
						accept="image/*"
						style={{ display: "none" }}
						id="button-file"
						type="file"
						onChange={handleThumbnailChange}
					/>
					<label htmlFor="button-file">
						<Button component={Box}
							sx={{
								width: '100%',
								paddingTop: '100%',
								position: 'relative',
							}}>
							<Box
								sx={{
									position: 'absolute',
									top: 0,
									right: 0,
									bottom: 0,
									left: 0,
									backgroundImage: `url(${thumbnail_url})`,
									backgroundSize: 'contain',
									backgroundPosition: 'center',
									backgroundRepeat: 'no-repeat'
								}}
							/>
						</Button>
					</label>
				</Grid>

			</Grid>
		</Grid>
	</>)
})

type SelectFromEpisodesProps = {
	onSelect: (episode: Episode) => void
}
const SelectFromEpisodes = ({ onSelect }: SelectFromEpisodesProps) => {
	const { episode, Input: SelectPodcast, Select:SelectEpisode } = useEpisodeSelect()
	useEffect(() => {
		if(!episode) return
		onSelect(episode)
	}, [episode])

	return (<div>
		<SelectPodcast />
		<SelectEpisode />
	</div>)
}

type ItemEditProps = {
	items: Episode[],
	onChange: (items: Episode[]) => void
}
const ItemEdit = ({ items, onChange }: ItemEditProps) => {
	const { value, del, set } = useReorder(items)

	useEffect(() => {
		set(items)
	}, [items])

	const handleChange = (items:Episode[]) => {
		set(items)
		onChange(items)
	}
	const handleDelete = useCallback((index: number) => {
		handleChange(del(index))
	}, [value])
	return items.length > 0 ?
		<ReorderableList
			items={value}
			onChange={handleChange}
			component={Card}
			componentProps={{
				sx:{
					marginTop: 2,
					marginBottom: 2,
					height:'20rem',
					overflowY:'scroll'
				}
			}}
		>
			{(item,i) =>
				<ListItem dense secondaryAction={<IconButton onClick={()=>handleDelete(i)}><DeleteIcon /></IconButton>}>
					{item.title}
				</ListItem>
			}
		</ReorderableList>
		: <Card sx={{
			marginTop: 2,
			marginBottom: 2,
			height:'20rem',
			overflowY:'scroll'
		}}>
			<ListItem>エピソードがありません</ListItem>
		</Card>
}

type PlaylistItemEditorProps = {
	value: Episode[]
}
type PlaylistItemEditorRef = {
	getValue: () => Episode[]
}
const PlaylistItemEditor = React.forwardRef<PlaylistItemEditorRef, PlaylistItemEditorProps>(({ value }, ref) => {
	const [items, setItems] = useState(value)
	useImperativeHandle(ref, () => ({
		getValue: () => items,
	}))
	const handleAddNewEpisode = (item: Episode): void => {
		setItems(prev => [...prev, item])
	}
	return <>
		<Grid container spacing={2}>
			<Grid item xs={12} md={8}>
				<Typography variant='h4'>プレイリスト</Typography>
				<ItemEdit items={items} onChange={setItems} />
			</Grid>
			<Grid item xs={12} md={4}>
				<Typography variant='h4'>追加するエピソードを選択</Typography>
				<SelectFromEpisodes onSelect={handleAddNewEpisode} />
			</Grid>
		</Grid>
	</>
})

type PlaylistEditorProps = {
	value: Playlist,
	onSave: (value: Playlist) => void
}
const PlaylistEditor = ({ value, onSave }: PlaylistEditorProps) => {
	const channel_ref = useRef<PlaylistChannelEditorRef>(null)
	const item_ref = useRef<PlaylistItemEditorRef>(null)
	const handleSave = (e: FormEvent) => {
		e.preventDefault()
		if (!channel_ref.current || !item_ref.current) return
		onSave({
			...channel_ref.current.getValue(),
			items: item_ref.current.getValue()
		})
	}
	return <>
		<Divider variant='fullWidth' sx={{ marginTop: 2, marginBottom: 2 }} />
		<form onSubmit={handleSave}>
			<PlaylistChannelEditor
				ref={channel_ref}
				value={value}
			/>
			<Divider variant='fullWidth' sx={{ marginTop: 2, marginBottom: 2 }} />
			<PlaylistItemEditor
				ref={item_ref}
				value={value.items}
			/>
			<Button type='submit' variant='contained'>{value.is_new?'save':'update'}</Button>
		</form>
	</>
};

export default PlaylistEditor;
