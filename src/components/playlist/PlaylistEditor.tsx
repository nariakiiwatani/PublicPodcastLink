import React, { useState, useEffect, useRef, useMemo, useCallback, useImperativeHandle, FormEvent } from "react";
import { TextField, ListItem, Grid, Button, Typography, Box, Card, Divider, IconButton, List, ListItemText, CircularProgress } from "@mui/material";
import { useEpisodeSelect } from '../../hooks/useEpisodeSelect';
import { Episode } from '../../types/podcast'
import { Playlist, playlist_base_url } from './Playlist';
import { ReorderableList, useReorder } from '../ReorderList';
import DeleteIcon from '@mui/icons-material/Delete'
import ReportIcon from '@mui/icons-material/Report';
import CheckIcon from '@mui/icons-material/Check';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { useContextPack } from '../../hooks/useContextPack';
import { useDialog } from '../../hooks/useDialog';
import { supabase } from '../../utils/supabase';

type PlaylistChannelEditorProps = {
	value: Playlist,
	onChangeReadyStatus: (okay: boolean) => void
}
interface PlaylistChannelEditorRef {
	getValue: () => Playlist;
}
const copyToClipboard = async (text: string) => {
	if ('clipboard' in navigator) {
		return await navigator.clipboard.writeText(text);
	} else {
		return document.execCommand('copy', true, text);
	}
};

const CopyToClipboard = ({ value, duration=2000, children }: { value: string, duration?: number, children: (value: string) => React.ReactNode }) => {
	const [status, setStatus] = useState('default');

	const handleClick = async () => {
		try {
			await copyToClipboard(value);
			setStatus('success');
		} catch (err) {
			setStatus('error');
		}
	};

	useEffect(() => {
		if (status !== 'default') {
			const timerId = setTimeout(() => setStatus('default'), duration);
			return () => clearTimeout(timerId);
		}
	}, [status]);
	return <Box sx={{ display: 'flex', cursor: 'pointer' }} onClick={handleClick}>
		{status === 'default' && <ContentPasteIcon fontSize='small' />}
		{status === 'success' && <DoneIcon fontSize='small' />}
		{status === 'error' && <ErrorIcon fontSize='small' />}
		{children(value)}
	</Box>
}
const PlaylistChannelEditor = React.forwardRef<PlaylistChannelEditorRef, PlaylistChannelEditorProps>(({ value, onChangeReadyStatus }, ref) => {
	const [alias, setAlias] = useState(value.alias)
	const [title, setTitle] = useState(value.title)
	const [author, setAuthor] = useState(value.author)
	const [description, setDescription] = useState(value.description)
	const [thumbnail, setThumbnail] = useState<File | string>(value.thumbnail)

	const fileInputRef = useRef<HTMLInputElement>(null)

	useImperativeHandle(ref, () => ({
		getValue: () => ({
			...value,
			alias,
			title,
			author,
			description,
			thumbnail,
		})
	}))

	const checkAliasValid = async (v: string) => {
		if(v === '') {
			setAliasError('入力してください')
			return
		}
		const invalid_chars = v.split('').filter(c => !/^[a-zA-Z0-9-._~!$&'()*+,;=:@]$/.test(c))
		if(invalid_chars.length > 0) {
			const unique = [...new Set(invalid_chars)];
			setAliasError(`URLに使用できない文字が含まれています: ${unique.join('')}`)
			return
		}
		setAliasPending(true)
		setAliasError(null)
		try {
			await supabase.from('playlist').select('alias').neq('id',value.id).eq('alias',v)
			.then(({data})=> !!data && data.length>0)
			.then(collide=> {
				if(collide) {
					setAliasError('既に使われています')
				}
			})
		}
		finally {
			setAliasPending(false)
		}
	}

	useEffect(() => {
		setAlias(value.alias)
		checkAliasValid(value.alias)
		setTitle(value.title)
		setAuthor(value.author)
		setDescription(value.description)
		setThumbnail(value.thumbnail)
		if(fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}, [value])

	const [is_alias_pending, setAliasPending] = useState(false)
	const [alias_error, setAliasError] = useState<string|null>(null)
	const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value
		setAlias(v)
		checkAliasValid(v)
	}

	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setThumbnail(file)
		}
	}
	const thumbnail_url = useMemo(() => thumbnail instanceof File ? URL.createObjectURL(thumbnail) : thumbnail, [thumbnail])
	useEffect(() => {
		const is_submittable = !is_alias_pending && !alias_error
		onChangeReadyStatus(is_submittable)
	}, [is_alias_pending, alias_error])

	return (<>
		<Grid container spacing={2} sx={{ marginTop: 2 }}>
			<Grid item xs={12} md={6} container alignContent='start' spacing={2} >
				<Grid item xs={12}>
					<Typography variant='h4'>タイトル</Typography>
					<TextField
						size='small'
						fullWidth
						variant='outlined'
						value={title}
						required
						onChange={(e) => setTitle(e.target.value)}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h4'>説明</Typography>
					<TextField
						size='small'
						fullWidth
						variant='outlined'
						value={description}
						rows={8}
						multiline
						required
						onChange={(e) => setDescription(e.target.value)}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h4'>作成者名</Typography>
					<TextField
						size='small'
						fullWidth
						variant='outlined'
						value={author}
						required
						onChange={(e) => setAuthor(e.target.value)}
					/>
				</Grid>
			</Grid>
			<Grid item xs={12} md={6} container spacing={2}>
				<Grid item xs={12}>
					<Typography variant='h4'>URL</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<TextField
							size='small'
							variant='outlined'
							value={alias}
							error={!!alias_error}
							helperText={alias_error}
							required
							onChange={handleAliasChange}
						/>
						{is_alias_pending ? <CircularProgress /> :
						!alias_error ? <CheckIcon color='success' /> : <ReportIcon color='error' />}
					</Box>
					<CopyToClipboard value={`${playlist_base_url}/${alias}/rss`}>
						{(value=><Typography variant='subtitle2'>RSS: {value}</Typography>)}
					</CopyToClipboard>
					<CopyToClipboard value={`${playlist_base_url}/${alias}/view`}>
						{(value=><Typography variant='subtitle2'>Playback: {value}</Typography>)}
					</CopyToClipboard>
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h4'>サムネイル（クリックしてアップロード）</Typography>
					<Grid item xs={6}>
						<input
							accept="image/*"
							style={{ display: "none" }}
							id="button-file"
							type="file"
							onChange={handleThumbnailChange}
							ref={fileInputRef}
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
		</Grid>
	</>)
})

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
		>
			{(item,i) =>
				<ListItem dense secondaryAction={<IconButton onClick={()=>handleDelete(i)}><DeleteIcon /></IconButton>}>
					<Grid container spacing={1} direction='row' alignItems='center'>
						<Grid item xs={1}><div style={{textAlign:'right'}}>{i+1}.  </div></Grid>
						<Grid item xs={10}>
							<ListItemText primary={item.title} />
						</Grid>
					</Grid>
				</ListItem>
			}
		</ReorderableList>
		: <div>
			<ListItem>エピソードがありません</ListItem>
		</div>
}

type PlaylistItemEditorProps = {
	value: Episode[]
}
type PlaylistItemEditorRef = {
	getValue: () => Episode[]
}
const PlaylistItemEditor = React.forwardRef<PlaylistItemEditorRef, PlaylistItemEditorProps>(({ value }, ref) => {
	const [items, setItems] = useState(value)
	const { episodes, Input: SelectPodcast } = useEpisodeSelect()
	const { ArrayProviderConsumer } = useContextPack<Episode>()
	useImperativeHandle(ref, () => ({
		getValue: () => items,
	}))
	const handleAddNewEpisode = (item: Episode): void => {
		setItems(prev => [...prev, item])
	}

	useEffect(() => {
		setItems(value)
	}, [value])

	const leftRef = useRef<HTMLDivElement>(null);
	const rightHeaderRef = useRef<HTMLDivElement>(null);
	const [contentHeight, setContentHeight] = useState('auto');
	useEffect(() => {
		if (leftRef.current && rightHeaderRef.current) {
			const spacing = 16
			setContentHeight(`${leftRef.current.offsetHeight - rightHeaderRef.current.offsetHeight - spacing}px`);
		}
	}, [items]);
	return <>
		<Grid container spacing={2}>
			<Grid item xs={12} md={8} ref={leftRef}>
				<Typography variant='h4'>プレイリスト</Typography>
				<Card sx={{ height:'20rem', overflow: 'auto', marginTop: 2, marginBottom: 2 }}>
					<ItemEdit items={items} onChange={setItems} />
				</Card>
			</Grid>
			<Grid item xs={12} md={4} container direction="column">
				<Grid item ref={rightHeaderRef}>
					<Typography variant='h4'>追加するエピソードを選択</Typography>
					<SelectPodcast />
				</Grid>
				<Grid item sx={{ height: contentHeight, overflow: 'auto' }}>
					<List>
						<ArrayProviderConsumer value={episodes}>
							{(value) => (
								<ListItem
									component={Button}
									onClick={() => handleAddNewEpisode(value)}
								>{value.title}</ListItem>
							)}
						</ArrayProviderConsumer>
					</List>
				</Grid>
			</Grid>
		</Grid>
	</>
})

type PlaylistEditorProps = {
	value: Playlist,
	onSave: (value: Playlist) => void
	onDelete: (id: string) => void
}
const PlaylistEditor = ({ value, onSave, onDelete }: PlaylistEditorProps) => {
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
	const deleteDialog = useDialog()
	const handleDelete = (id: string) => {
		deleteDialog.close()
		onDelete(id)
	}
	const [submitableStatus, setSubmittableStatus] = useState<{[key:string]:boolean}>({})
	const handleSubmittableStatusChanged = (slot: string) => (okay: boolean) => {
		setSubmittableStatus(prev => ({
			...prev,
			[slot]: okay
		}))
	}

	return <>
		<Divider variant='fullWidth' sx={{ marginTop: 2, marginBottom: 2 }} />
		<form onSubmit={handleSave}>
			<PlaylistChannelEditor
				ref={channel_ref}
				value={value}
				onChangeReadyStatus={handleSubmittableStatusChanged('channel')}
			/>
			<Divider variant='fullWidth' sx={{ marginTop: 2, marginBottom: 2 }} />
			<PlaylistItemEditor
				ref={item_ref}
				value={value.items}
			/>
			<Button type='submit' variant='contained' disabled={Object.values(submitableStatus).some(ok=>!ok)}>{value.is_new?'公開':'更新'}</Button>
		</form>
		{!value.is_new && <>
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
		</>}
	</>
};

export default PlaylistEditor;
