import { useState, useEffect, useMemo, ChangeEvent, FormEvent, useRef } from 'react'
import { supabase } from '../utils/supabase'
import { Box, Icon, IconButton, Link, List, ListItem, TextField, Tooltip } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import PendingIcon from '@mui/icons-material/Pending'
import { AddNewString } from '../components/AddNewString'

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
			.catch(console.error)
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
	const value = useMemo(() => result.map(r => ({ url: r, icon: getPlatformIcon(r) })), [result])
	return {
		value,
		add,
		del,
		edit
	}
}

export const getPlatformIcon = (url: string) => {
	const make_url = (name: string, ext: string = 'png') => `/platform_icons/${name}.${ext}`
	const approved_list: { [key: string]: string | string[] } = {
		'https://(.*\.)?github\.com': 'github',
		'https://(.*\.)?youtube\.com': 'youtube',
		'https://(.*\.)?twitter\.com': 'twitter',
		'https://podcasters.spotify\.com': 'sfpc',
		'https://(.*\.)?spotify\.com': 'spotify',
		'https://(.*\.)?note\.com': 'note',
		'https://(.*\.)?lit\.link': 'litlink',
		'https://(.*\.)?linktr\.ee': 'linktr',
		'https://(.*\.)?instagram\.com': 'instagram',
		'https://podcasts.google\.com': ['google_podcasts', 'svg'],
		'https://(.*\.)?facebook\.com': 'facebook',
		'https://podcasts.apple\.com': 'apple_podcasts',
		'https://music.amazon\.com': 'amazon_music',
		'https://(.*\.)?scrapbox\.io': 'scrapbox',
		'https://(.*\.)?discord\.com': 'discord',
		'https://(.*\.)?listen\.style': 'listen',
		'https://(.*\.)?zenn\.dev': 'zenn',
		'https://(.*\.)?qiita\.com': 'qiita',
		'https://(.*\.)?linkedin\.com': 'linkedin',
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

export const RelatedLinks = ({url}:{url: string}) => {
	const { value } = useRelatedLinks(url)
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

export const RelatedLinksEditor = ({url}:{url: string}) => {
	const { value, add, del, edit } = useRelatedLinks(url)
	const handleEdit = (index: number) => async (url: string) => {
		if(value.some(({url:u},i)=>i!==index&&u===url)) {
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
		if(value.some(({url:u})=>u===url)) {
			return false
		}
		await add(url)
		return true
	}
	return (
		<List>
			{value.map((value,i) => <LinkItem key={value.url} {...value} onEdit={handleEdit(i)} onDelete={handleDelete(i)} />)}
			<AddNewString onAdd={handleAdd} />
		</List>
	)
}