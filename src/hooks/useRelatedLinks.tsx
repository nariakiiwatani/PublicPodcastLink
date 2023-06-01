import { useState, useEffect, useMemo, ChangeEvent, FormEvent, useRef, createContext, useContext } from 'react'
import { supabase } from '../utils/supabase'
import { Box, Icon, IconButton, Link, List, ListItem, TextField, Tooltip } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import PendingIcon from '@mui/icons-material/Pending'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import { AddNewString } from '../components/AddNewString'
import { useTranslation } from './useTranslation'
import { Container, Draggable, DropResult } from "react-smooth-dnd"

const table_name = 'related_link'

const get_db = async (channel: string) => {
	const result = await supabase.from(table_name)
		.select('link_url')
		.eq('channel', channel)
	if (!result?.data) {
		return []
	}
	return result.data.flatMap(({ link_url }) => link_url)
}

const set_db = async (channel: string, item: string[]) => {
	await supabase.from(table_name).upsert({ channel, link_url: item })
	return item
}

export const useRelatedLinks = (channel: string) => {
	const [result, setResult] = useState<string[]>([])
	useEffect(() => {
		get_db(channel)
			.then(setResult)
			.catch(console.error)
	}, [channel])
	const set = (items: string[]) => {
		return set_db(channel, items)
			.then(result => {
				setResult(result)
				return result
			})
			.catch(e => {
				console.error(e)
				return [] as string[]
			})
	}
	const add = (new_value: string) => {
		return set([...result, new_value])
	}
	const del = (index: number) => {
		const new_array = [...result]
		new_array.splice(index, 1)
		return set(new_array)
	}
	const edit = (index: number, new_value: string) => {
		const new_array = [...result]
		new_array[index] = new_value
		return set(new_array)
	}
	const move = (index_from: number, index_to: number) => {
		const new_array = [...result]
		const [removed] = new_array.splice(index_from, 1)
		new_array.splice(index_to, 0, removed)
		return set(new_array)
	}
	const value = useMemo(() => result.map(r => ({ url: r, icon: getPlatformIcon(r) })), [result])
	return {
		value,
		add,
		del,
		edit,
		move
	}
}

export const getPlatformIcon = (url: string) => {
	const make_url = (name: string, ext: string = 'png') => `/platform_icons/${name}.${ext}`
	const approved_list: { [key: string]: string | string[] } = {
		'https://(.*\.)?github\.com/': 'github',
		'https://(.*\.)?youtube\.com/': 'youtube',
		'https://(.*\.)?twitter\.com/': 'twitter',
		'https://podcasters.spotify\.com/': 'sfpc',
		'https://(.*\.)?spotify\.com/': 'spotify',
		'https://spoti\.fi/': 'spotify',
		'https://(.*\.)?note\.com/': 'note',
		'https://(.*\.)?lit\.link/': 'litlink',
		'https://(.*\.)?linktr\.ee/': 'linktr',
		'https://(.*\.)?instagram\.com/': 'instagram',
		'https://podcasts.google\.com/': ['google_podcasts', 'svg'],
		'https://(.*\.)?google\.com/podcasts\?': ['google_podcasts', 'svg'],
		'https://(.*\.)?facebook\.com/': 'facebook',
		'https://podcasts.apple\.com/': 'apple_podcasts',
		'https://apple\.co/': 'apple_podcasts',
		'https://music.amazon\.com/': 'amazon_music',
		'https://music.amazon\.co\.jp/': 'amazon_music',
		'https://(.*\.)?scrapbox\.io/': 'scrapbox',
		'https://(.*\.)?discord\.com/': 'discord',
		'https://(.*\.)?listen\.style/': 'listen',
		'https://(.*\.)?zenn\.dev/': 'zenn',
		'https://(.*\.)?qiita\.com/': 'qiita',
		'https://(.*\.)?linkedin\.com/': 'linkedin',
	}
	const found_key = Object.keys(approved_list).find(tester => new RegExp(tester).test(url))
	if (found_key) {
		let args = approved_list[found_key]
		args = Array.isArray(args) ? args : [args]
		return make_url(args[0], args[1])
	}
	return null
}


type LinkItemProps = {
	url: string
	icon: string | null
	onEdit: (value: string) => void
	onDelete: () => void
}
const LinkItem = ({ url, icon, onEdit, onDelete }: LinkItemProps) => {
	const { t } = useTranslation('related_links')
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
		onEdit(value)
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
			return t.not_approved(origin)
		}
		catch(e: any) {
			return t.not_url
		}
	}, [icon, edit, url])
	return (
		<ListItem>
			<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
				<Icon sx={{ marginRight: 1, overflow: 'visible', width: '32px', height: 'auto' }}>
					{icon
						? <img src={icon} width='100%' height='100%' />
						: <Tooltip title={pending_text}><PendingIcon /></Tooltip>}
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

const RelatedLinksContext = createContext<ReturnType<typeof useRelatedLinks>>({
	value: [],
	add: (_: string): Promise<string[]> => Promise.resolve([]),
	del: (_: number): Promise<string[]> => Promise.resolve([]),
	edit: (_: number, __: string): Promise<string[]> => Promise.resolve([]),
	move: (_: number, __: number): Promise<string[]> => Promise.resolve([]),
})
export const RelatedLinksProvider = ({ children, url }: {
	children: React.ReactNode
	url: string
}) => {
	const value = useRelatedLinks(url)
	return <RelatedLinksContext.Provider value={value}>
		{children}
	</RelatedLinksContext.Provider>
}

export const RelatedLinks = () => {
	const { value } = useContext(RelatedLinksContext)
	return (<>
		{value.filter(({ icon }) => icon)
			.map(({ url, icon }, i) => (
				<IconButton
					key={i}
					component={Link} href={url} target='_blank'
				>
					<img src={icon!} width='32px' height='auto' />
				</IconButton>
			))}
	</>)
}

const DraggableContainer = (props:{children:React.ReactElement}&React.ComponentProps<typeof Container>) => {
	const { children, render:_, ...rest } = props
	return (<Container {...rest}>{children}</Container>)
}
const DraggableItem = (props:{children:React.ReactElement}&React.ComponentProps<typeof Draggable>) => {
	const { children, render:_, ...rest } = props
	return (<Draggable {...rest}>{children}</Draggable>)
}
export const RelatedLinksEditor = () => {
	const { value, add, del, edit, move } = useContext(RelatedLinksContext)
	const handleEdit = (index: number) => async (url: string) => {
		if(value.some(({ url: u }, i) => i !== index && u === url)) {
			return false
		}
		await edit(index, url)
		return true
	}
	const handleDelete = (index: number) => async () => {
		await del(index)
		return true
	}
	const handleAdd = async (url: string) => {
		if(value.some(({ url: u }) => u === url)) {
			return false
		}
		await add(url)
		return true
	}
	const handleDrop = async ({ removedIndex, addedIndex }: DropResult) => {
		if(removedIndex === null || addedIndex === null) {
			return false
		}
		await move(removedIndex, addedIndex)
		return true
	};
	return (
		<List>
			<DraggableContainer
				onDrop={handleDrop}
				dragHandleSelector=".dragHandleSelector"
			>
				<>
				{value.map((value, i) => (
					<DraggableItem key={value.url}>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
							padding="8px"
						>
							<DragHandleIcon className="dragHandleSelector" sx={{ cursor: 'pointer' }}/>
							<LinkItem {...value} onEdit={handleEdit(i)} onDelete={handleDelete(i)} />
						</Box>
					</DraggableItem>
				))}
				</>
			</DraggableContainer >
			<AddNewString onAdd={handleAdd} />
		</List>
	)
}