import React, { useState, useMemo, useContext, useEffect } from 'react';
import { ListItemText, TextField, Autocomplete } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';
import { FollowingContext } from '../hooks/useFollows';

type PodcastInputProps = {
	setUrl: (url: string) => void;
};

const is_url = (value: string) => new RegExp('https?://.+').test(value)

const PodcastInput: React.FC<PodcastInputProps> = ({ setUrl }) => {
	const [value, setValue] = useState('---')
	const { podcasts } = useContext(FollowingContext)
	const { t } = useTranslation('select_channel')
	const selectedPodcast = podcasts.find(p=>p.url === value) ?? { url: '', title: value };
	const options = useMemo(() => selectedPodcast.url === '' ? [selectedPodcast, ...podcasts] : podcasts, [podcasts, selectedPodcast])
	useEffect(() => {
		if(is_url(value)) {
			setUrl(value)
		}
	}, [value])

	return (
		<Autocomplete
			fullWidth
			disableClearable={podcasts.length === 0}
			options={options}
			value={selectedPodcast}
			getOptionLabel={(option) => option.title}
			isOptionEqualToValue={(option, value) => option.url === value.url}
			onChange={(_, value) => value && setValue(value.url)}
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
				<li {...props}>
					<ListItemText primary={option.title} />
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
