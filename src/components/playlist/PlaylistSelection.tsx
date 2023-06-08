import { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, SelectChangeEvent } from "@mui/material";

type Props = {
	playlists: {id: string, alias: string}[],
	onSelect: (value: string) => void,
	onNew: () => void
}

const PlaylistSelection = ({ playlists, onSelect, onNew }: Props) => {
	const [value, setValue] = useState('default');

	const handlePlaylistChange = (e: SelectChangeEvent<string>) => {
		const v = e.target.value
		setValue(v)
		onSelect(v)
	};

	const handleNewPlaylistClick = () => {
		onNew()
		setValue('default')
	};

	return (
		<div>
			<FormControl>
				<InputLabel id="playlist-select-label">Select a Playlist</InputLabel>
				<Select
					labelId="playlist-select-label"
					value={value}
					onChange={handlePlaylistChange}
				>
					<MenuItem value='default' disabled sx={{display:'none'}}>新規作成</MenuItem>
					{playlists.map((playlist) => (
						<MenuItem key={playlist.id} value={playlist.id}>{playlist.alias}</MenuItem>
					))}
				</Select>
			</FormControl>
			{value !== 'default' && <Button onClick={handleNewPlaylistClick}>or Create New</Button>}
		</div>
	);
};

export default PlaylistSelection;
