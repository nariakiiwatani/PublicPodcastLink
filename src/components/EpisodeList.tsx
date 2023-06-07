import React, { useState } from 'react';
import { Episode } from '../types/podcast';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { InputLabel, List, ListItem } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation'

type EpisodeListProps = {
	episodes: Episode[];
	onSelect: (id: string) => void;
};

export const EpisodeSelect: React.FC<EpisodeListProps> = ({ episodes, onSelect }) => {
	const { t } = useTranslation('select_episode')
	const [value, setValue] = useState('')
	const handleChange = (e: SelectChangeEvent) => {
		const v = e.target.value
		setValue(v)
		onSelect(v)
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
export const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, onSelect }) => {
	const { t } = useTranslation('select_episode')
	const handleClick = (id: string) => {
		onSelect(id)
	}
	return (
		<FormControl fullWidth sx={{ marginTop: 1 }}>
			<InputLabel variant="standard" htmlFor="episode-select-element">
				{t.label}
			</InputLabel>
			<List
				dense
			>
				{episodes.map((episode) => (
					<ListItem key={episode.id} value={episode.id} onClick={()=>handleClick(episode.id)}>
						{episode.title}
					</ListItem>
				))}
			</List>
		</FormControl>
	);
};
