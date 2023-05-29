import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ChangeEvent, useRef, FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsync } from 'react-use'
import usePodcast from './hooks/usePodcast'
import { Podcast } from './types/podcast'
import PodcastPreview from './components/PodcastPreview'
import { ListItem, List, TextField, Box, IconButton, Link, Icon, Tooltip, Typography } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import PendingIcon from '@mui/icons-material/Pending'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useRelatedLinks } from './hooks/useRelatedLinks'

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

const check_if_valid_owner = async (channel: string, key: string): Promise<boolean> => {
	const url = `${import.meta.env.VITE_API_PATH}/check_owner?channel=${channel}&key=${key}`
	const result = await fetch(url)
	return result.ok
}


const CheckOwner = ({ children }: { children: React.ReactNode }) => {
	const { channel, key } = useQuery()
	const { loading, error, value } = useAsync(async () => {
		if (!channel || !key) {
			return
		}
		return check_if_valid_owner(channel, key)
	}, [channel, key])
	return (
		loading ? <>loading...</>
			: !value || error ? <>invalid</>
				: <>{children}</>
	)
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

const NotAnOwner = () => {
	return (
		<a href={window.origin} target='_self'>not an owner?</a>
	)
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

const RelatedLinks = () => {
	const { podcast: src } = useContext(ChannelContext)
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

const Manager = () => {
	const { podcast: src } = useContext(ChannelContext)
	if (!src) return null
	return (<>
		<h1>管理画面: {`${src.title}`}</h1>
		<NotAnOwner />
		<hr />
		<h2>Related Links</h2>
		<RelatedLinks />
		<hr />
		<h2>Preview</h2>
		<PodcastPreview podcast={src} />
	</>)
}

const Owner: React.FC = () => {
	return (
		<CheckOwner>
			<ChannelContextProvider>
				<Manager />
			</ChannelContextProvider>
		</CheckOwner>
	)
}
export default Owner