import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'
import PodcastInput from './components/PodcastInput';
import PodcastPreview from './components/PodcastPreview';
import EpisodeList from './components/EpisodeList';
import EpisodePreview from './components/EpisodePreview';
import { TweetButton } from './components/TwitterButton'
import usePodcast from './hooks/usePodcast';
import { CssBaseline, ThemeProvider, createTheme, Grid, Button, Card, Box } from '@mui/material';
import Header from './components/Header';

const theme = createTheme({
	palette: {
		mode: 'light',
	},
});

function useQuery() {
	return new URLSearchParams(useLocation().search);
}
const App: React.FC = () => {
	const [podcasts, setPodcasts] = useState<{ url: string, title: string }[]>(JSON.parse(localStorage.getItem('podcasts') ?? '[]'));
	const [url, setUrl_] = useState('');
	const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
	const { podcast, episodes, fetchPodcast, clearPodcast } = usePodcast();

	const query = useQuery();

	const setUrl = (url: string) => {
		if (!podcasts.find(({ title }) => title === url)) {
			setUrl_(url)
		}
	}

	const deleteUrl = useCallback((url: string) => {
		setPodcasts(prev => prev.filter(p => p.url !== url))
		clearPodcast()
	}, [setPodcasts, clearPodcast])

	useEffect(() => {
		let url = query.get('channel')
		let guid = query.get('item')
		console.info({url,guid})
		if (url) {
			url = decodeURIComponent(url)
			if(guid) guid = decodeURIComponent(guid)
			updateSelected(url, guid).then(() => setUrl(url!))
		}
	}, [])

	useEffect(() => {
		if (url) {
			updateSelected(url, selectedEpisodeId)
		}
	}, [url]);

	const updateSelected = useCallback((url: string, episode_id: string | null) => {
		return fetchPodcast(url).then((result) => {
			if (result) {
				const { podcast: pod, episodes: epi } = result
				const newPodcasts = [...podcasts]
				const prev = newPodcasts.find(({ url: prev_url }) => url === prev_url)
				if (prev) {
					prev.title = pod.title
				}
				else {
					newPodcasts.push({ url, title: pod.title })
				}
				setPodcasts(newPodcasts);
				if (epi.length > 0) {
					if (episode_id && epi.find(({ id }: { id: string }) => id === episode_id)) {
						setSelectedEpisodeId(episode_id)
					}
					else {
						setSelectedEpisodeId(epi[0].id)
					}
				}
				localStorage.setItem('podcasts', JSON.stringify(newPodcasts));
			}
		});
	}, [fetchPodcast, podcasts, setPodcasts])


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
				{podcast && <>
					<PodcastPreview podcast={podcast} ShareButton={<TweetButton rss_url={url} channel={podcast} />} />
					{selectedEpisode && <>
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
						<EpisodePreview episode={selectedEpisode} ShareButton={<TweetButton rss_url={url} channel={podcast} episode={selectedEpisode} />} />
					</>}
				</>}
			</Box>
		</ThemeProvider>
	);
};

export default App;
