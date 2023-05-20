import React from 'react';
import { Episode } from '../types/podcast';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { InputLabel } from '@mui/material';

type EpisodeListProps = {
	episodes: Episode[];
	selectedEpisodeId: string | null;
	setSelectedEpisodeId: (id: string | null) => void;
};

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, selectedEpisodeId, setSelectedEpisodeId }) => {
	return (
		<FormControl fullWidth sx={{ marginTop: 1 }}>
			<InputLabel variant="standard" htmlFor="uncontrolled-native">
				エピソードを選択
			</InputLabel>
			<Select
				variant='standard'
				inputProps={{
					name: 'hogehoge',
					id: 'uncontrolled-native',
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