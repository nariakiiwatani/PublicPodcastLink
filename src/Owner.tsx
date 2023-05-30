import React, { useState, useEffect, useMemo, ChangeEvent, useRef, FormEvent } from 'react'
import usePodcast from './hooks/usePodcast'
import { Podcast } from './types/podcast'
import PodcastPreview from './components/PodcastPreview'
import { ListItem, List, TextField, Box, IconButton, Link, Icon, Tooltip, Typography, Button, CircularProgress, MenuItem, Select, SelectChangeEvent, ListSubheader, TextFieldProps } from '@mui/material'
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

const email_for_debug = import.meta.env.VITE_DEBUG_EMAIL
console.info({email_for_debug})

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
			</form>
			{edit ? <>
				<IconButton aria-label='submit' onClick={handleSubmit}>
					<CheckIcon />
				</IconButton>
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
			</form>
				<IconButton aria-label='submit' onClick={handleSubmit}>
					<CheckIcon />
				</IconButton>
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
		!email_for_debug && !session ? <>
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
		const user_email = session?.user?.email??email_for_debug
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
	return (
		<Typography>{podcast?.title??url}</Typography>
	)
}

const SelectChannel = ({owned, shared, onChange}: {
	owned: string[]
	shared: string[]
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
		<MenuItem value='owned' disabled={true}>owned</MenuItem>
		{owned.map(ch=><MenuItem key={ch} value={ch}>
			<FetchTitle url={ch} />
		</MenuItem>)}
		<MenuItem value='shared' disabled={true}>shared</MenuItem>
		{shared.map(ch=><MenuItem key={ch} value={ch}>
			<FetchTitle url={ch} />
		</MenuItem>)}
	</Select>
}

const AddNewChannel = ({onChange}:{onChange:()=>void}) => {
	const {session} = useSession()
	const user_email = session?.user?.email??email_for_debug
	const { get:isEditable, add:requestEditable } = useChannelSharedWith(user_email)
	const { fetchPodcast } = usePodcast()
	const [error, setError] = useState('')
	const [pending, setPending] = useState(false)
	const handleAdd = (value: string) => {
		setPending(true)
		setError('')
		isEditable(value)
		.then(result => {
			if(result) {
				setError('already added')
				return
			}
			return fetchPodcast(value)
			.then(result => {
				if(!result?.podcast) throw 'failed to fetch'
				if(result.podcast.owner.email !== user_email) throw 'not yours'
				return requestEditable(result.podcast.self_url)
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
	return (<ListItem
		secondaryAction={
			<Button onClick={()=>onDelete(value)} variant='contained' color='error'>delete</Button>
		}
	>
		<FetchTitle url={value} />
	</ListItem>)
}
const ChannelList = ({owned, shared, onChange}: {
	owned: string[]
	shared: string[]
	onChange: ()=>void
}) => {
	const {session} = useSession()
	const user_email = session?.user?.email??email_for_debug
	const { del:deleteEditable } = useChannelSharedWith(user_email)
	const handleDelete = (value: string) => {
		deleteEditable(value)
		onChange()
	}
	return (<>
	<List>
		<ListSubheader>所有する番組</ListSubheader>
		{owned.map((ch,i)=><DeletableItem key={i} onDelete={handleDelete} value={ch} />)}
	</List>
	{shared && shared.length > 0 &&
	<List>
		<ListSubheader>共同編集番組</ListSubheader>
		{shared.map((ch,i)=><DeletableItem key={i} onDelete={handleDelete} value={ch} />)}
	</List>}
	</>)
}

const Manager = () => {
	const [podcast, setPodcast] = useState<Podcast|null>(null)
	const { owned, shared, refresh } = useEditableChannels()
	const loading = !owned || !shared
	const { open:openSettings, Dialog:EditChannelListModal } = useDialog()

	const is_owned = useMemo(() => podcast && owned && owned.includes(podcast.self_url), [podcast, owned])

	return (<>
		<h1>管理画面</h1>
		<Box sx={{display:'flex', alignItems:'center'}}>
		{!loading && <>
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
			<hr />
			{is_owned && <>共同管理者をうんたらかんたら</>}
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