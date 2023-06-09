import React, { useState, useMemo, useContext, useEffect } from 'react';
import { ListItem, ListItemText, TextField, Autocomplete, IconButton } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';
import { FollowingContext } from '../hooks/useFollows';
import { fetch_podcast } from '../hooks/usePodcast';
import { Podcast } from '../types/podcast';
import DeleteIcon from '@mui/icons-material/Delete';

type PodcastInputProps = {
	option: Podcast | null
	setUrl: (url: string) => void;
	deletable?: boolean
};

const is_url = (value: string) => new RegExp('https?://.+').test(value)

const PodcastInput: React.FC<PodcastInputProps> = ({ option, setUrl, deletable }) => {
	const [value, setValue] = useState('')
	const { podcasts, del } = useContext(FollowingContext)
	const { t } = useTranslation('select_channel')
	const options = useMemo(() => {
		if(!option || podcasts.includes(option.self_url)) {
			return podcasts.includes(value) ? podcasts : [value, ...podcasts]
		}
		return [option.self_url, ...podcasts]
	}, [podcasts, option])
	useEffect(() => {
		if(is_url(value)) {
			setUrl(value)
		}
	}, [value])
	const [titles, setTitles] = useState<{[url:string]:string}>({})
	useEffect(() => {
		options.filter(p=>!(p in titles))
		.forEach(url => {
			if(!is_url(url)) return
			fetch_podcast(url).then(result => {
				setTitles(prev=> ({
					...prev,
					[url]: result ? result.podcast.title : 'failed to fetch'
				}))
			})
		})
	}, [options])
	const handleDelete = (url: string) => {
		del(url)
	}

	return (
		<Autocomplete
			fullWidth
			options={options}
			value={option?.self_url??value}
			getOptionLabel={(op) => titles[op??'']??''}
			onChange={(_, value) => value && setValue(value)}
			onInputChange={(_, value) => {
				if (value) {
					if(is_url(value)) {
						setValue(value)
					}
				}
				else {
					setValue('')
				}
			}}
			renderOption={(props, option, { selected:_ }) => (
				<ListItem {...props} key={option}
					secondaryAction={deletable&&<IconButton onClick={()=>handleDelete(option)}><DeleteIcon /></IconButton>}>
					<ListItemText primary={titles[option]} secondary={option} />
				</ListItem>
			)}
			renderInput={(params) => (
				<TextField
					{...params}
					variant='standard'
					label={t.label}
					fullWidth
				/>
			)} />
	);
};

export default PodcastInput;
