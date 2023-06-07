import { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, SelectChangeEvent } from "@mui/material";

type Props = {
	playlists: string[],
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
						<MenuItem key={playlist} value={playlist}>{playlist}</MenuItem>
					))}
				</Select>
			</FormControl>

			<Button onClick={handleNewPlaylistClick}>Create New Playlist</Button>
		</div>
	);
};

export default PlaylistSelection;
