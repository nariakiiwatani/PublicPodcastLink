import React, { FormEvent, useState } from 'react';
import { TextField, Button, FormControl, Select, MenuItem, InputLabel, CircularProgress, SelectChangeEvent } from '@mui/material';

type PodcastFormProps = {
	onSubmit: (url: string) => void;
	savedPodcasts: string[];
	loading: boolean;
};

const PodcastForm: React.FC<PodcastFormProps> = ({ onSubmit, savedPodcasts, loading }) => {
	const [url, setUrl] = useState('');

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit(url);
		setUrl('');
	};

	const handleSelect = (e: SelectChangeEvent) => {
		setUrl(e.target.value as string);
	};

	return (
		<form onSubmit={handleSubmit}>
			<TextField
				value={url}
				onChange={e => setUrl(e.target.value)}
				label="Podcast RSS URL"
				variant="outlined"
				fullWidth
				style={{ marginTop: 20 }}
			/>
			<FormControl fullWidth variant="outlined" style={{ marginTop: 20 }}>
				<InputLabel id="saved-podcasts-label">Saved Podcasts</InputLabel>
				<Select
					labelId="saved-podcasts-label"
					id="saved-podcasts"
					value={url}
					onChange={handleSelect}
					label="Saved Podcasts"
				>
					{savedPodcasts.map((podcast, index) => (
						<MenuItem key={index} value={podcast}>
							{podcast}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Button type="submit" variant="contained" color="primary" style={{ marginTop: 20 }}>
				{loading ? <CircularProgress size={24} /> : 'Load Podcast'}
			</Button>
		</form>
	);
};

export default PodcastForm;
