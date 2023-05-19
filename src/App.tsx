import React, { useState, useEffect, useCallback } from 'react';
import PodcastInput from './components/PodcastInput';
import PodcastPreview from './components/PodcastPreview';
import EpisodeList from './components/EpisodeList';
import EpisodePreview from './components/EpisodePreview';
import usePodcast from './hooks/usePodcast';
import { CssBaseline, ThemeProvider, createTheme, Grid, Button, Card, Box } from '@mui/material';
import Header from './components/Header';

const theme = createTheme({
	palette: {
		mode: 'light',
	},
});

const App: React.FC = () => {
	const [podcasts, setPodcasts] = useState<{ url: string, title: string }[]>([]);
	const [url, setUrl_] = useState('');
	const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);

	const setUrl = (url:string) => {
		if(!podcasts.find(({title})=>title===url)) {
			setUrl_(url)
		}
	}
	const { podcast, episodes, fetchPodcast, clearPodcast } = usePodcast();

	const deleteUrl = useCallback((url: string) => {
		setPodcasts(prev => prev.filter(p=>p.url!==url))
		clearPodcast()
	}, [setPodcasts, clearPodcast])

	useEffect(() => {
		const storedPodcasts = localStorage.getItem('podcasts');
		if (storedPodcasts) {
			setPodcasts(JSON.parse(storedPodcasts));
		}
	}, []);

	useEffect(() => {
		if (url) {
			fetchPodcast(url).then((pod) => {
				if (pod) {
					const newPodcasts = [...podcasts]
					const prev = newPodcasts.find(({url:prev_url})=>url===prev_url)
					if(prev) {
						prev.title = pod.title
					}
					else {
						newPodcasts.push({url,title:pod.title})
					}
					setPodcasts(newPodcasts);
					localStorage.setItem('podcasts', JSON.stringify(newPodcasts));
				}
			});
		}
	}, [url]);

	useEffect(() => {
		if (episodes.length > 0) {
			setSelectedEpisodeId(episodes[0].id);
		}
	}, [episodes]);

	const selectedEpisode = episodes.find((episode) => episode.id === selectedEpisodeId) ?? null;

	const currentIndex = episodes.findIndex((episode) => episode.id === selectedEpisodeId);

	const onNext = () => {
		if (currentIndex > 0) {
			setSelectedEpisodeId(episodes[currentIndex - 1].id);
		}
	};

	const onPrevious = () => {
		if (currentIndex < episodes.length - 1) {
			setSelectedEpisodeId(episodes[currentIndex + 1].id);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Header />
			<Box sx={{ margin: 2 }}>
				<Card style={{ display: 'flex', marginTop: 20, paddingTop: 20 }}>
					<PodcastInput url={url} setUrl={setUrl} deleteUrl={deleteUrl} podcasts={podcasts} />
				</Card>
				<PodcastPreview podcast={podcast} />
				<Grid container spacing={1} alignItems='center'>
					<Grid item xs={12} md={1} marginTop={2}>
						<Button onClick={onPrevious} variant='outlined' disabled={currentIndex >= episodes.length - 1}>{'<<'}</Button>
					</Grid>
					<Grid item xs={12} md={10}>
						<EpisodeList episodes={episodes} selectedEpisodeId={selectedEpisodeId} setSelectedEpisodeId={setSelectedEpisodeId} />
					</Grid>
					<Grid item xs={12} md={1} marginTop={2}>
						<Button onClick={onNext} variant='outlined' disabled={currentIndex <= 0}>{'>>'}</Button>
					</Grid>
				</Grid>
				<EpisodePreview episode={selectedEpisode} />
			</Box>
		</ThemeProvider>
	);
};

export default App;
