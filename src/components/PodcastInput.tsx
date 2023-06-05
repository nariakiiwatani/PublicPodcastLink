import React, { useState, useMemo, useContext, useEffect } from 'react';
import { ListItemText, TextField, Autocomplete } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';
import { FollowingContext } from '../hooks/useFollows';
import { fetch_podcast } from '../hooks/usePodcast';

type PodcastInputProps = {
	setUrl: (url: string) => void;
};

const is_url = (value: string) => new RegExp('https?://.+').test(value)

const PodcastInput: React.FC<PodcastInputProps> = ({ setUrl }) => {
	const [value, setValue] = useState('---')
	const { podcasts } = useContext(FollowingContext)
	const { t } = useTranslation('select_channel')
	const selectedPodcast = useMemo(()=>podcasts.find(p=>p === value) ?? '', [podcasts, value]);
	const options = useMemo(() => selectedPodcast === '' ? [selectedPodcast, ...podcasts] : podcasts, [podcasts, selectedPodcast])
	useEffect(() => {
		if(is_url(value)) {
			setUrl(value)
		}
	}, [value])
	const [titles, setTitles] = useState<{[url:string]:string}>({})
	useEffect(() => {
		podcasts.filter(p=>!(p in titles))
		.forEach(url => {
			fetch_podcast(url).then(result => {
				if(!result) return
				setTitles(prev=> ({
					...prev,
					[url]: result.podcast.title
				}))
			})
		})
	}, [podcasts])

	return (
		<Autocomplete
			fullWidth
			disableClearable={podcasts.length === 0}
			options={options}
			value={selectedPodcast}
			getOptionLabel={(option) => titles[option]??''}
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
				<li {...props} key={option}>
					<ListItemText primary={titles[option]} />
				</li>
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
