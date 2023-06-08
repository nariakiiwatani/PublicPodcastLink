import { useState, useEffect } from "react";
import { FormControl, Select, MenuItem, SelectChangeEvent, Typography, Box } from "@mui/material";
import { fetch_podcast } from '../../hooks/usePodcast';
import { playlist_rss_url } from './Playlist';


const AsyncString = ({ promise, defaultValue }: { promise: Promise<string>, defaultValue: string }) => {
	const [data, setData] = useState(defaultValue);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await promise;
				setData(result);
			} catch (error) {
				console.error('Error:', error);
			}
		};
		fetchData();
	}, [promise]);

	return <>{data}</>
}
type PlaylistSelectionProps = {
	playlists: {id: string, alias: string}[],
	value?: string,
	onSelect: (value: string) => void,
	onNew: () => void
}
const default_value = 'default'
const PlaylistSelection = ({ playlists, value=default_value, onSelect, onNew }: PlaylistSelectionProps) => {
	const [titles, setTitles] = useState<{[key:string]:React.ReactNode}>({})
	useEffect(() => {
		setTitles(prev => {
			const ret = {...prev}
			playlists.forEach(({id, alias}) => {
				if(!(id in ret)) {
					ret[id] = <AsyncString promise={
							fetch_podcast(playlist_rss_url(alias)).then(result=>result?result.podcast.title:`no title(${alias})`)
						}
						defaultValue={`fetching...(${alias})`}
					/>
				}
			})
			return ret
		})
	}, [playlists])

	const handlePlaylistChange = (e: SelectChangeEvent<string>) => {
		const v = e.target.value
		if(v === default_value) {
			onNew()
		}
		else {
			onSelect(v)
		}
	}

	return (
		<div>
			<FormControl>
				<Box sx={{display:'flex', flexDirection:'row', alignItems:'baseline'}}>
				<Typography variant='h3' sx={{marginRight: 2}}>プレイリストを選択</Typography>
				<Select
					variant='standard'
					value={value}
					onChange={handlePlaylistChange}
				>
					<MenuItem value='default'>新規作成</MenuItem>
					{playlists.map((playlist) => (
						<MenuItem key={playlist.id} value={playlist.id}>{titles[playlist.id]??'unknown'}</MenuItem>
					))}
				</Select>
				</Box>
			</FormControl>
		</div>
	);
};

export default PlaylistSelection;
