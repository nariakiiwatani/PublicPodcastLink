import React, { useState, useEffect, useMemo, ChangeEvent, useRef, FormEvent } from 'react'
import usePodcast from './hooks/usePodcast'
import { Podcast } from './types/podcast'
import PodcastPreview from './components/PodcastPreview'
import { ListItem, List, TextField, Box, IconButton, Link, Icon, Tooltip, Typography, Button, CircularProgress, MenuItem, Select, SelectChangeEvent, ListSubheader, TextFieldProps, ListItemText } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import PendingIcon from '@mui/icons-material/Pending'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SettingsIcon from '@mui/icons-material/Settings'
import { useRelatedLinks } from './hooks/useRelatedLinks'
import { useDialog } from './hooks/useDialog'
import { supabase, useSession } from './utils/supabase'
import Header from './components/Header'
import { useChannelSharedWith } from './hooks/useChannelSharedWith'

type LinkItemProps = {
	url: string
	icon: string | null
	onEdit: (value: string) => boolean|Promise<boolean>
	onDelete: () => boolean|Promise<boolean>
}
const LinkItem = ({ url, icon, onEdit, onDelete }: LinkItemProps) => {
	const [value, setValue] = useState(url)
	const [edit, setEdit] = useState(false)
	const text_field_ref = useRef<HTMLInputElement>(null)
	const handleEdit = () => {
		setEdit(true)
	}
	useEffect(() => {
		if(edit) {
			text_field_ref.current?.focus()
		}
	}, [edit])
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value)
	}
	const handleSubmit = async (e: FormEvent<any>) => {
		e.preventDefault()
		if(!await onEdit(value)) {
			setValue(url)
		}
		setEdit(false)
	}
	const handleDelete = () => {
		onDelete()
		setEdit(false)
	}
	const pending_text = useMemo(() => {
		if(icon || edit) return null
		try {
			const origin = new URL(url).origin
			return `approval request for "${origin}" have sent. please wait for manual approval.`
		}
		catch(e: any) {
			return `not an URL?`
		}
	}, [icon, edit, url])
	return (
	<ListItem>
		<Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
			<Icon sx={{marginRight:1, overflow:'visible', width:'32px', height: 'auto'}}>
				{icon
				?<img src={icon} width='100%' height='100%' />
				:<Tooltip title={pending_text}><PendingIcon /></Tooltip>}
			</Icon>
			<form onSubmit={handleSubmit}>
				<TextField
					type='url'
					disabled={!edit}
					value={value}
					inputRef={text_field_ref}
					size='small'
					variant='standard'
					onChange={handleChange}
					helperText={pending_text}
					sx={{
						minWidth: `${Math.max(value.length, 24) * 0.5}rem`
					}}
				/>
			{edit &&
				<IconButton aria-label='submit' type='submit'>
					<CheckIcon />
				</IconButton>
			}
			</form>
			{edit ? <>
				<IconButton aria-label='delete' onClick={handleDelete}>
					<DeleteIcon />
				</IconButton>
			</> : <>
				<IconButton aria-label='edit' onClick={handleEdit}>
					<EditIcon />
				</IconButton>
				<IconButton aria-label='open_in_new' component={Link} href={value} target='_blank'>
					<OpenInNewIcon />
				</IconButton>
			</>}
		</Box>
	</ListItem>)
}

type AddNewStringProps = {
	onAdd: (value: string) => void|boolean|Promise<boolean>
	textFieldProps?: TextFieldProps
}
const AddNewString = ({onAdd, textFieldProps}:AddNewStringProps) => {
	const [value, setValue] = useState('')
	const [edit, setEdit] = useState(false)
	const text_field_ref = useRef<HTMLInputElement>(null)
	const handleEdit = () => {
		setEdit(true)
	}
	useEffect(() => {
		if(edit) {
			text_field_ref.current?.focus()
		}
	}, [edit])
	const handleCancel = () => {
		setEdit(false)
	}
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value)
	}
	const handleSubmit = (e: FormEvent<any>) => {
		e.preventDefault()
		onAdd(value)
		setValue('')
		setEdit(false)
	}
	return (
		<Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
			<IconButton
				sx={{marginRight:1, overflow:'visible', width:'32px', height: 'auto'}}
				onClick={edit?handleCancel:handleEdit}
			>
				{edit ? <CancelIcon /> : <AddCircleIcon />}
			</IconButton>
			{edit
			? <>
			<form onSubmit={handleSubmit}>
				<TextField
					{...textFieldProps}
					disabled={textFieldProps?.disabled || !edit}
					value={edit?value:'Add New'}
					inputRef={text_field_ref}
					size='small'
					variant='standard'
					onChange={handleChange}
					onClick={handleEdit}
					sx={{
						minWidth: `${Math.max(value.length, 24) * 0.5}rem`
					}}
				/>
				<IconButton aria-label='submit' type='submit'>
					<CheckIcon />
				</IconButton>
			</form>
			</>
			: <Typography variant='body2' onClick={handleEdit}>Add New</Typography>}
		</Box>
	)
}

const RelatedLinks = ({podcast:src}:{podcast:Podcast}) => {
	const { value, update } = useRelatedLinks(src?.self_url??'')
	const handleEdit = (i:number) => async (url: string) => {
		if(!value) return false
		const arr = [...value.data.map(({url})=>url)]
		arr[i] = url
		const res = await update(arr)
		return res !== false
	}
	const handleDelete = (i:number) => async () => {
		if(!value) return false
		const arr = [...value.data.map(({url})=>url)]
		arr.splice(i,1)
		const res = await update(arr)
		return res !== false
	}
	const handleAdd = async (url: string) => {
		if(!value) return false
		const arr = [...value.data.map(({url})=>url), url]
		const res = await update(arr)
		return res !== false
	}
	return (
		<List>
			{value?.data.map((value,i) => <LinkItem key={value.url} {...value} onEdit={handleEdit(i)} onDelete={handleDelete(i)} />)}
			<AddNewString onAdd={handleAdd} />
		</List>
	)
}
const EditableListItem = ({defaultValue, textFieldProps, Icon, onEdit, onDelete}:{
	defaultValue: string
	textFieldProps?: Partial<TextFieldProps>
	Icon?: React.ReactNode
	onEdit: (value: string) => void
	onDelete: () => void
}) => {
	const [value, setValue] = useState(defaultValue)
	const [edit, setEdit] = useState(false)
	const text_field_ref = useRef<HTMLInputElement>(null)
	const handleEdit = () => {
		setEdit(true)
	}
	useEffect(() => {
		if(edit) {
			text_field_ref.current?.focus()
		}
	}, [edit])
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value)
	}
	const handleSubmit = (e: FormEvent<any>) => {
		e.preventDefault()
		onEdit(value)
		setEdit(false)
	}
	const handleDelete = () => {
		onDelete()
		setEdit(false)
	}
	return (
	<ListItem dense>
		<Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
			{Icon}
			<form onSubmit={handleSubmit}>
				<TextField
					disabled={!edit}
					value={value}
					inputRef={text_field_ref}
					size='small'
					variant='standard'
					onChange={handleChange}
					sx={{
						minWidth: `${Math.max(value.length, 24) * 0.5}rem`
					}}
					{...textFieldProps}
				/>
				{edit &&
					<IconButton aria-label='submit' type='submit'>
						<CheckIcon />
					</IconButton>}
				{edit ? <>
					<IconButton aria-label='delete' onClick={handleDelete}>
						<DeleteIcon />
					</IconButton>
				</> : <>
					<IconButton aria-label='edit' onClick={handleEdit}>
						<EditIcon />
					</IconButton>
				</>}
			</form>
		</Box>
	</ListItem>)
}
const EditableList = ({value, type, onEdit, onDelete, onAdd, is_unique}:{
	value: string[]
	type?: string
	onEdit: (index: number, value: string) => void
	onDelete: (index: number) => void
	onAdd: (value: string) => void
	is_unique?: boolean
}) => {
	const handleEdit = is_unique ? (index: number, new_value: string) => {
		if(value.some((v,i)=>i!==index&&v===new_value)) {
			return false
		}
		onEdit(index, new_value)
	} : onEdit
	const handleAdd = is_unique ? (item: string) => {
		if(value.some(v=>v===item)) {
			return false
		}
		onAdd(item)
	} : onAdd
	return (
		<List>
			{value.map((value,i) => <EditableListItem
				key={value}
				defaultValue={value}
				textFieldProps={{type}}
				onEdit={(v)=>handleEdit(i,v)}
				onDelete={()=>onDelete(i)}
			/>)}
			<AddNewString onAdd={handleAdd} textFieldProps={{type}}/>
		</List>
	)
}

const EditSharedMembers = ({podcast:src}:{podcast:Podcast}) => {
	const { session } = useSession()
	const { get, add, del } = useChannelSharedWith()
	const [value, setValue] = useState<string[]>([])
	const without_me = useMemo(() => value.filter(email => email !== session?.user.email), [value, session])
	useEffect(() => {
		if(!session) return
		get({channel:src.self_url}).then(res => {
			if(!res) return
			setValue(res.flatMap(({shared_with})=>shared_with))
		})
	}, [src, session])
	const handleAdd = (item: string) => {
		add({channel:src.self_url, email:item})
		.then(result => result.filter(({channel})=>channel===src.self_url))
		.then(result => {
			setValue(result[0].shared_with)
		})
		.catch(console.error)
	}
	const handleEdit = (index: number, new_value: string) => {
		del({channel:src.self_url, email:without_me[index]})
		.then(() => add({channel:src.self_url, email:new_value}))
		.then(result => result.filter(({channel})=>channel===src.self_url))
		.then(result => {
			setValue(result[0].shared_with)
		})
		.catch(console.error)
	}
	const handleDelete = (index: number) => {
		del({channel:src.self_url, email:without_me[index]})
		.then(result => result.filter(({channel})=>channel===src.self_url))
		.then(result => {
			setValue(result[0].shared_with)
		})
		.catch(console.error)
	}
	return (<EditableList
		type='email'
		is_unique={true}
		value={without_me}
		onAdd={handleAdd}
		onEdit={handleEdit}
		onDelete={handleDelete}
	/>)
}

const Login = () => {
	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState('')

	const handleLogin = async (event: FormEvent) => {
		event.preventDefault()

		setLoading(true)
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${window.origin}/owner`
			}
		})

		if (error) {
			alert(error.message)
		} else {
			alert('Check your email for the login link!')
		}
		setLoading(false)
	}

	return (<>
		<form className="form-widget" onSubmit={handleLogin}>
			<TextField
				type="email"
				placeholder="Your email"
				value={email}
				required={true}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<Button disabled={loading} variant='contained' type='submit'>
				{loading ? <CircularProgress /> : <>Send magic link</>}
			</Button>
		</form>
		</>
	)
}
const CheckAuth = ({ children }: { children: React.ReactNode }) => {
	const { session } = useSession()
	return (
		!session ? <>
			<p>Login required</p>
			<Login />
		</>
		: <>
			{children}
		</>
	)
}
type ChannelWithOwned = {channel:string,owned:boolean}
const useEditableChannels = () => {
	const {session} = useSession()
	const [value, setValue] = useState<ChannelWithOwned[]|null>(null)
	const { fetchPodcast } = usePodcast()
	const refresh = async () => {
		const user_email = session?.user?.email
		if(!user_email) return
		const {data} = await supabase.from('channel_shared_with')
			.select('channel, shared_with')
			.contains('shared_with', [user_email])
		if(!data) return
		setValue(await Promise.all(data.map(({channel}) => 
			fetchPodcast(channel)
			.then(result=>({
				channel,
				owned: result?.podcast.owner.email === user_email
			}))
		)))
	}
	const [owned, shared] = useMemo(() => [
		value?.filter(({owned})=>owned).map(({channel})=>channel),
		value?.filter(({owned})=>!owned).map(({channel})=>channel),
	], [value])
	useEffect(() => {
		refresh()
	}, [session])

	return {value, owned, shared, refresh}
}

const FetchTitle = ({url}:{url:string}) => {
	const { podcast } = usePodcast(url)
	return (<>
		{podcast?.title??url}
	</>)
}

const SelectChannel = ({owned, shared, onChange}: {
	owned?: string[]
	shared?: string[]
	onChange: (podcast:Podcast|null)=>void
}) => {
	const [value, setValue] = useState(()=>owned?.[0]??shared?.[0]??'')
	const {podcast, fetchPodcast} = usePodcast(value)
	const handleSelect = (e: SelectChangeEvent) => {
		const value = e.target.value
		setValue(value)
		fetchPodcast(value)
	}
	useEffect(() => {
		onChange(podcast)
	}, [podcast])
	return <Select
		value={value}
		onChange={handleSelect}
	>
		{owned && <MenuItem value='owned' disabled={true}>所有する番組</MenuItem>}
		{owned && owned.map(ch=><MenuItem key={ch} value={ch}>
			<FetchTitle url={ch} />
		</MenuItem>)}
		{shared && <MenuItem value='shared' disabled={true}>共有された番組</MenuItem>}
		{shared && shared.map(ch=><MenuItem key={ch} value={ch}>
			<FetchTitle url={ch} />
		</MenuItem>)}
	</Select>
}

const AddNewChannel = ({onChange}:{onChange:()=>void}) => {
	const {session} = useSession()
	const user_email = session?.user?.email
	const { check:isEditable, add:requestEditable } = useChannelSharedWith()
	const { fetchPodcast } = usePodcast()
	const [error, setError] = useState('')
	const [pending, setPending] = useState(false)
	const handleAdd = (value: string) => {
		setPending(true)
		setError('')
		isEditable({channel:value, email: user_email})
		.then(result => {
			if(result) {
				setError('already added')
				return
			}
			return fetchPodcast(value)
			.then(result => {
				if(!result?.podcast) throw 'failed to fetch'
				if(result.podcast.owner.email !== user_email) throw 'not yours'
				return requestEditable({channel: result.podcast.self_url, email: user_email})
			})
			.then(() => {
				onChange()
				setError('added')
			})
			.catch(setError)
		})
		.finally(()=>
			setPending(false)
		)
	}
	return <>
		<AddNewString onAdd={handleAdd} textFieldProps={{disabled:pending}} />
		<Typography color='error' variant='caption'>{error}</Typography>
	</>
}

const DeletableItem = ({value, onDelete}:{
	value:string
	onDelete:(url:string)=>void 
}) => {
	const { podcast } = usePodcast(value)
	const typographyProps = {sx:{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
	return (<ListItem
		sx={{width: '70%'}}
		secondaryAction={
			<Button onClick={()=>onDelete(value)} variant='contained' color='error'>delete</Button>
		}
	>
		<ListItemText
			primary={podcast?.title??''}
			primaryTypographyProps={typographyProps}
			secondary={value}
			secondaryTypographyProps={typographyProps}
			/>
	</ListItem>)
}
const ChannelList = ({owned, shared, onChange}: {
	owned?: string[]
	shared?: string[]
	onChange: ()=>void
}) => {
	const {session} = useSession()
	const user_email = session?.user?.email
	const { del:deleteEditable } = useChannelSharedWith()
	const handleDelete = (value: string) => {
		deleteEditable({channel: value, email: user_email})
		onChange()
	}
	return (<>
	<List sx={{minWidth: '50vw'}}>
	{owned && <>
		<ListSubheader>所有する番組</ListSubheader>
		{owned.map((ch,i)=><DeletableItem key={i} onDelete={handleDelete} value={ch} />)}
	</>}
	</List>
	{shared && shared.length > 0 &&
	<List>
		<ListSubheader>共同編集番組</ListSubheader>
		{shared.map((ch,i)=><DeletableItem key={i} onDelete={handleDelete} value={ch} />)}
	</List>}
	</>)
}

const Manager = () => {
	const { session } = useSession()
	const [podcast, setPodcast] = useState<Podcast|null>(null)
	const { owned, shared, refresh } = useEditableChannels()
	const { open:openSettings, Dialog:EditChannelListModal } = useDialog()

	const is_owned = useMemo(() => podcast && owned && owned.includes(podcast.self_url), [podcast, owned])

	return (<>
		<h1>管理画面</h1>
		<Box sx={{display:'flex', alignItems:'center'}}>
		{session && <>
		<SelectChannel owned={owned} shared={shared} onChange={setPodcast} />
		<IconButton onClick={openSettings}>
			<SettingsIcon />
		</IconButton>
		<EditChannelListModal title='番組リストを管理'>
			<AddNewChannel onChange={refresh} />
			<ChannelList owned={owned} shared={shared} onChange={refresh} />
		</EditChannelListModal>
		</>}
		</Box>
		{podcast && <>
			{is_owned && <>
				<hr />
				<h2>共同編集者を編集</h2>
				<EditSharedMembers podcast={podcast} />
			</>}
			<hr />
			<h2>Related Links</h2>
			<RelatedLinks podcast={podcast} />
			<hr />
			<h2>Preview</h2>
			<PodcastPreview podcast={podcast} />
		</>}
	</>)
}

const Owner: React.FC = () => {
	return (<>
		<Header />
		<CheckAuth>
			<Manager />
		</CheckAuth>
	</>
	)
}
export default Owner