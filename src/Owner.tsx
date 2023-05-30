import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ChangeEvent, useRef, FormEvent, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsync } from 'react-use'
import usePodcast from './hooks/usePodcast'
import { Podcast } from './types/podcast'
import PodcastPreview from './components/PodcastPreview'
import { ListItem, List, TextField, Box, IconButton, Link, Icon, Tooltip, Typography, Button, CircularProgress, MenuItem, Menu, ListItemText, Select, SelectChangeEvent } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import PendingIcon from '@mui/icons-material/Pending'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useRelatedLinks } from './hooks/useRelatedLinks'
import { useDialog } from './hooks/useDialog'
import { supabase, useSession } from './utils/supabase'
import { Session } from '@supabase/supabase-js'
import Header from './components/Header'

function useQuery() {
	const location = useLocation()
	const params = new URLSearchParams(location.search)
	return useMemo(() => {
		return {
			channel: params.get('channel'),
			key: params.get('key')
		}
	}, [location.search])
}

const OwnerRequest = ({podcast}:{podcast: Podcast}) => {
	const handleSendEmail = async () => {
		const url = `${import.meta.env.VITE_API_PATH}/auth?email=${podcast.owner.email}&channel=${podcast.self_url}`
		const result = await fetch(url, {
			method: 'POST'
		})
		console.info({result})
	}
	return (<Button onClick={handleSendEmail}>request</Button>)
}

export const useOwnerRequestPopup = (podcast: Podcast) => {
	const requestable = useMemo(()=>podcast.owner.email!=='',[podcast])
	const { open, Dialog } = useDialog()
	const Element = useCallback(() => {
		return <Dialog title='request ownership'>
				<OwnerRequest podcast={podcast} />
			</Dialog>
	}, [Dialog, podcast])
	return {
		enable: requestable,
		open,
		Dialog: Element
	}
}

const ChannelContext = createContext<{
	podcast: Podcast | null
}>({
	podcast: null
})
const ChannelContextProvider = ({ children }: {
	children: React.ReactNode
}) => {
	const { channel } = useQuery()
	const { podcast, fetchPodcast } = usePodcast()
	useAsync(async () => {
		if (!channel) return
		fetchPodcast(channel)
	}, [channel])
	return (<ChannelContext.Provider value={{ podcast }}>
		{children}
	</ChannelContext.Provider>)
}

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

type AddRelatedLinkProps = {
	onAdd: (value: string) => boolean|Promise<boolean>
}
const AddRelatedLink = ({onAdd}:AddRelatedLinkProps) => {
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
	<ListItem>
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
					disabled={!edit}
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
	</ListItem>
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
			<AddRelatedLink onAdd={handleAdd} />
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
				emailRedirectTo: `${import.meta.env.VITE_SITE_ORIGIN}/owner`
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
const CheckAuth = ({ skip, children }: { skip?:boolean, children: React.ReactNode }) => {
	const { session } = useSession()
	return (
		!skip && !session ? <>
			<p>Login required</p>
			<Login />
		</>
		: <>
			{children}
		</>
	)
}

const useEditableChannels = () => {
	const {session} = useSession()
	const {value, loading, error} = useAsync(async () => {
		try {
			const {data} = await supabase.from('editable_channel')
			.select('owned,shared')
			.eq('id', session?.user?.id??'dbb0c322-9b8c-409e-8622-80a6a02306d1')
			.single()
			return {
				owned:data?.owned??[],
				shared:data?.shared??[]
			}
		}
		catch(e: any) {
			return {owned:[],shared:[]}
		}
	}, [session])
	return {value, loading, error}
}

const FetchTitle = ({url, do_fetch}:{url:string, do_fetch:boolean}) => {
	const { podcast } = usePodcast(do_fetch?url:undefined)
	return (
		<Typography>{podcast?.title??url}</Typography>
	)
}

const SelectChannel = ({items, onChange}:{
	items:{[key:string]:string[]}
	onChange: (podcast:Podcast|null)=>void
}) => {
	const [value, setValue] = useState(()=>Object.values(items)[0][0]??'')
	const {podcast, fetchPodcast} = usePodcast(value)
	const handleSelect = (e: SelectChangeEvent) => {
		const value = e.target.value
		setValue(value)
		fetchPodcast(value)
	}
	useEffect(() => {
		onChange(podcast)
	}, [podcast])
	const options = useMemo(() => {
		return Object.entries(items).reduce<{value:string,disabled?:boolean}[]>((ret, [group, value]) => {
			return [...ret, {disabled:true, value:group}, ...value.map(v=>({value:v}))]
		}, [])
	}, [items])
	return <Select
		value={value}
		onChange={handleSelect}
	>
		{options.map(({value,disabled}, idx) =>
			<MenuItem key={idx} value={value} disabled={disabled}>
				<FetchTitle url={value} do_fetch={!disabled} />
			</MenuItem>)}
	</Select>
}
const Manager = () => {
	const [podcast, setPodcast] = useState<Podcast|null>(null)
	const { value, loading, error } = useEditableChannels()
	
	return (<>
		<h1>管理画面</h1>
		{value && <SelectChannel items={value} onChange={setPodcast} />}
		{podcast && <>
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
		<CheckAuth skip={true}>
			<ChannelContextProvider>
				<Manager />
			</ChannelContextProvider>
		</CheckAuth>
	</>
	)
}
export default Owner