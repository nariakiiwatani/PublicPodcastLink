import { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, SelectChangeEvent } from "@mui/material";
import { Playlist } from '.';

type Props = {
	playlists: {id: string, alias: string}[],
	onSelect: (value: string) => void,
	onNew: () => void
}

const PlaylistSelection = ({ playlists, onSelect, onNew }: Props) => {
	const [value, setValue] = useState("");

	const handlePlaylistChange = (e: SelectChangeEvent<string>) => {
		const v = e.target.value
		setValue(v);
		onSelect(v);
	};

	const handleNewPlaylistClick = () => {
		onNew();
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
					{playlists.map((playlist) => (
						<MenuItem key={playlist.id} value={playlist.id}>{playlist.alias}</MenuItem>
					))}
				</Select>
			</FormControl>

			<Button onClick={handleNewPlaylistClick}>Create New Playlist</Button>
		</div>
	);
};

export default PlaylistSelection;
