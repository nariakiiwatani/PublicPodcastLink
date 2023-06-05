import React, { useState, useEffect, useMemo, ChangeEvent, useRef, FormEvent, createContext, useContext, useCallback } from 'react'
import usePodcast, { fetch_podcast } from './hooks/usePodcast'
import { Podcast } from './types/podcast'
import PodcastPreview from './components/PodcastPreview'
import { ListItem, List, TextField, Box, IconButton, Typography, Button, MenuItem, Select, SelectChangeEvent, ListSubheader, TextFieldProps, ListItemText, CssBaseline } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import { RelatedLinksEditor, RelatedLinksProvider } from './hooks/useRelatedLinks'
import { useDialog } from './hooks/useDialog'
import { SessionContext } from './utils/supabase'
import Header from './components/Header'
import { useChannelSharedWith, useEditableChannel } from './hooks/useChannelSharedWith'
import { AddNewString } from './components/AddNewString'
import { useQuery } from './hooks/useQuery'
import { useTranslation } from './hooks/useTranslation'
import { useNavigate } from 'react-router-dom'
import { FetchTitle } from './utils/FetchTitle'
import { CheckAuth, redirectURL } from './components/Login'

const EditableListItem = ({ defaultValue, textFieldProps, Icon, onEdit, onDelete }: {
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
		if (edit) {
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
			<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
const EditableList = ({ value, type, onEdit, onDelete, onAdd, is_unique }: {
	value: string[]
	type?: string
	onEdit: (index: number, value: string) => Promise<any>
	onDelete: (index: number) => Promise<any>
	onAdd: (value: string) => Promise<any>
	is_unique?: boolean
}) => {
	const handleEdit = is_unique ? async (index: number, new_value: string) => {
		if (value.some((v, i) => i !== index && v === new_value)) {
			return false
		}
		await onEdit(index, new_value)
		return true
	} : onEdit
	const handleAdd = is_unique ? async (item: string) => {
		if (value.some(v => v === item)) {
			return false
		}
		await onAdd(item)
		return true
	} : onAdd
	return (
		<List>
			{value.map((value, i) => <EditableListItem
				key={value}
				defaultValue={value}
				textFieldProps={{ type }}
				onEdit={(v) => handleEdit(i, v)}
				onDelete={() => onDelete(i)}
			/>)}
			<AddNewString onAdd={handleAdd} textFieldProps={{ type }} />
		</List>
	)
}

const SharedMembersEditor = ({ url }: { url: string }) => {
	const { session } = useContext(SessionContext)
	const { value, add, del, edit } = useChannelSharedWith(url)
	const without_me = useMemo(() => value.filter(email => email !== session?.user.email), [value, session])
	return (<EditableList
		type='email'
		is_unique={true}
		value={without_me}
		onAdd={add}
		onEdit={edit}
		onDelete={del}
	/>)
}


const SelectChannel = ({ onChange }: {
	onChange: (podcast: Podcast | null) => void
}) => {
	const { t } = useTranslation('owner')
	const { owned, shared } = useContext(EditableChannelContext)
	const [value, setValue] = useState(() => owned?.[0] ?? shared?.[0] ?? '')

	const navigate = useNavigate()

	const { request: requestNew } = useRequestChannel()
	const query = useQuery()
	useEffect(() => {
		const url = query.get('channel')
		const req = async (url: string) => {
			return await requestNew(url)
		}
		if (url) {
			req(url).then(result => {
				if (result) {
					setValue(url)
				}
			})
		}
	}, [query, requestNew])

	const { podcast, fetchPodcast } = usePodcast(value)
	const handleSelect = (e: SelectChangeEvent) => {
		const value = e.target.value
		setValue(value)
		fetchPodcast(value)
			.then(result => {
				if (!result) return
				navigate(`/owner?channel=${value}`)
			})
	}
	useEffect(() => {
		onChange(podcast)
	}, [podcast])
	return <Select
		value={value}
		onChange={handleSelect}
	>
		{owned && <MenuItem value='owned' disabled={true}>{t.label_owned}</MenuItem>}
		{owned && owned.map(ch => <MenuItem key={ch} value={ch}>
			<FetchTitle url={ch} />
		</MenuItem>)}
		{shared && <MenuItem value='shared' disabled={true}>{t.label_shared}</MenuItem>}
		{shared && shared.map(ch => <MenuItem key={ch} value={ch}>
			<FetchTitle url={ch} />
		</MenuItem>)}
	</Select>
}

const compare_icase = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

const AddNewChannel = () => {
	const { t } = useTranslation('owner')
	const { session } = useContext(SessionContext)
	const user_email = session?.user?.email
	const { check: alreadyAdded, add, refresh } = useContext(EditableChannelContext)
	const [error, setError] = useState('')
	const [pending, setPending] = useState(false)
	const handleAdd = (value: string) => {
		setError('')
		setPending(true)
		return new Promise<string>((resolve, reject) => {
			if (alreadyAdded(value)) {
				return reject(t.already_added)
			}
			resolve(value)
		})
			.then(value => fetch_podcast(value))
			.then(result => {
				if (!result?.podcast) throw t.rss_fetch_failed
				if (!user_email || !compare_icase(result.podcast.owner.email, user_email)) throw t.not_yours(redirectURL(result.podcast.self_url))
				return add(result.podcast.self_url)
			})
			.then(() => {
				refresh()
				setError(t.added)
				return true
			})
			.catch(e => {
				setError(e)
				return false
			})
			.finally(() =>
				setPending(false)
			)
	}
	return <>
		<AddNewString onAdd={handleAdd} textFieldProps={{ disabled: pending }} />
		<Typography color='error' variant='caption'>{error}</Typography>
	</>
}

const ChannelListItem = ({ value, onDelete }: {
	value: string
	onDelete?: (url: string) => void
}) => {
	const { podcast } = usePodcast(value)
	const typographyProps = { sx: { maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
	return (<ListItem
		sx={{ width: '70%' }}
		secondaryAction={
			onDelete && <Button onClick={() => onDelete(value)} variant='contained' color='error'>delete</Button>
		}
	>
		<ListItemText
			primary={podcast?.title ?? ''}
			primaryTypographyProps={typographyProps}
			secondary={value}
			secondaryTypographyProps={typographyProps}
		/>
	</ListItem>)
}
const ChannelList = () => {
	const { t } = useTranslation('owner')
	const { owned, shared, del, refresh } = useContext(EditableChannelContext)
	const handleDelete = (url: string) => {
		del(url).then(() => refresh())
	}
	return (<>
		<List sx={{ minWidth: '50vw' }}>
			{owned && <>
				<ListSubheader>{t.label_owned}</ListSubheader>
				{owned.map((ch, i) => <ChannelListItem key={i} value={ch} />)}
			</>}
		</List>
		{shared && shared.length > 0 &&
			<List>
				<ListSubheader>{t.label_shared}</ListSubheader>
				{shared.map((ch, i) => <ChannelListItem key={i} onDelete={handleDelete} value={ch} />)}
			</List>}
	</>)
}

const useRequestChannel = () => {
	const { session } = useContext(SessionContext)
	const add_new = useContext(EditableChannelContext)

	const request = useCallback((url: string) => {
		if (add_new.check(url)) {
			return true
		}

		return fetch_podcast(url)
			.then(result => {
				if (!result) return false
				const { podcast } = result
				if (session?.user.email && compare_icase(podcast.owner.email, session?.user.email)) {
					add_new.add(podcast.self_url)
					return true
				}
				return false
			})
	}, [session, add_new.check, add_new.add, fetch_podcast])
	return { request }
}

const Manager = () => {
	const { t } = useTranslation('owner')
	const { session } = useContext(SessionContext)

	const [podcast, setPodcast] = useState<Podcast | null>(null)
	const { owned } = useContext(EditableChannelContext)
	const { open: openSettings, Dialog: EditChannelListModal } = useDialog()

	const is_owned = useMemo(() => podcast && owned && owned.includes(podcast.self_url), [podcast, owned])

	return (<>
		<h1>{t.title}</h1>
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			{session && <>
				<SelectChannel onChange={setPodcast} />
				<IconButton onClick={openSettings}>
					<SettingsIcon />
				</IconButton>
				<EditChannelListModal title={t.channel_list}>
					<AddNewChannel />
					<ChannelList />
				</EditChannelListModal>
			</>}
		</Box>
		{podcast && <>
			{is_owned && <>
				<hr />
				<h2>{t.shared_members}</h2>
				<SharedMembersEditor url={podcast.self_url} />
			</>}
			<hr />
			<RelatedLinksProvider url={podcast.self_url}>
				<h2>{t.related_links}</h2>
				<RelatedLinksEditor />
				<hr />
				<h2>{t.preview}</h2>
				<PodcastPreview podcast={podcast} />
			</RelatedLinksProvider>
		</>}
	</>)
}

const EditableChannelContext = createContext<ReturnType<typeof useEditableChannel>>({
	value: [],
	owned: [],
	shared: [],
	check: (_: string): boolean => false,
	add: (_: string): Promise<string[]> => Promise.resolve([]),
	del: (_: string): Promise<string[]> => Promise.resolve([]),
	refresh: () => { }
})
const EditableChannelContextProvider = ({ children }: { children: React.ReactNode }) => {
	const value = useEditableChannel()
	return <EditableChannelContext.Provider value={value}>
		{children}
	</EditableChannelContext.Provider>
}

const Owner: React.FC = () => {
	return (<>
		<CssBaseline />
		<Header />
		<Box sx={{ margin: 2 }}>
			<CheckAuth>
				<EditableChannelContextProvider>
					<Manager />
				</EditableChannelContextProvider>
			</CheckAuth>
		</Box>
	</>
	)
}
export default Owner