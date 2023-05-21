import React from 'react';
import { Episode } from '../types/podcast';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { InputLabel } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation'

type EpisodeListProps = {
	episodes: Episode[];
	selectedEpisodeId: string | null;
	setSelectedEpisodeId: (id: string | null) => void;
};

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, selectedEpisodeId, setSelectedEpisodeId }) => {
	const { t } = useTranslation('select_episode')
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
				value={selectedEpisodeId || ''}
				onChange={(e) => setSelectedEpisodeId(e.target.value as string)}
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