import React, { useState } from 'react';
import { Episode } from '../types/podcast';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { InputLabel } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation'

type EpisodeListProps = {
	episodes: Episode[];
	onChange: (id: string) => void;
};

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, onChange }) => {
	const { t } = useTranslation('select_episode')
	const [value, setValue] = useState('')
	const handleChange = (e: SelectChangeEvent) => {
		const v = e.target.value
		setValue(v)
		onChange(v)
	}
	return (
		<FormControl fullWidth sx={{ marginTop: 1 }}>
			<InputLabel variant="standard" htmlFor="episode-select-element">
				{t.label}
			</InputLabel>
			<Select
				variant='standard'
				inputProps={{
					id: 'episode-select-element',
				}}
				value={value}
				onChange={handleChange}
			>
				{episodes.map((episode) => (
					<MenuItem key={episode.id} value={episode.id}>
						{episode.title}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default EpisodeList;