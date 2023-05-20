import React, { useState, useMemo } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';

type PodcastInputProps = {
	url: string;
	setUrl: (url: string) => void;
	podcasts: { url: string, title: string }[];
	deleteUrl: (url: string) => void;
};

const PodcastInput: React.FC<PodcastInputProps> = ({ url, setUrl, podcasts, deleteUrl }) => {
	const { t } = useTranslation('select_channel')
	const [pending, setPending] = useState<string>('---')
	const selectedPodcast = podcasts.find(podcast => podcast.url === url)??{url:'',title:pending};
	const options = useMemo(() => selectedPodcast.url==='' ? [selectedPodcast, ...podcasts] : podcasts, [podcasts, selectedPodcast])

	return (
		<Autocomplete
			fullWidth
			disableClearable={podcasts.length===0}
			options={options}
			value={selectedPodcast}
			getOptionLabel={(option) => option.title}
			onChange={(_, value) => value && setUrl(value.url)}
			onInputChange={(_, value) => {
				if(value) {
					setUrl(value)
					setPending(value)
				}
				else {
					deleteUrl(url)
					setUrl('')
					setPending('---')
				}
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					variant='standard'
					label={t.label}
					fullWidth
				/>
			)}
		/>
	);
};

export default PodcastInput;
