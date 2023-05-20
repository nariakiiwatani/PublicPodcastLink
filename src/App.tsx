import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom'
import PodcastInput from './components/PodcastInput';
import PodcastPreview from './components/PodcastPreview';
import EpisodeList from './components/EpisodeList';
import EpisodePreview from './components/EpisodePreview';
import { TweetButton } from './components/TwitterButton'
import usePodcast from './hooks/usePodcast';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import Header from './components/Header';
import { OpenInNewButton } from './components/OpenInNewButton';
import { Podcast, Episode } from './types/podcast';
import { shareUrl as createShareUrl } from './utils/permalink';
import { NavigatorButtons } from './components/NavigatorButtons';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

const theme = createTheme({
	palette: {
		mode: 'light',
	},
});

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

type ShareProps = {
	url: string
	channel: Podcast
	episode?: Episode
}
const ShareButtons = (props: ShareProps) => {
	return (<>
		<TweetButton {...props} />
		<OpenInNewButton {...props} />
	</>)
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
		if (url) {
			url = decodeURIComponent(url)
			if (guid) guid = decodeURIComponent(guid)
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

	const shareUrl = createShareUrl(url, selectedEpisodeId ?? undefined)

	const Navigator = useMemo(() =>
		<NavigatorButtons
			prev={{
				value: <><SkipPreviousIcon />{episodes[currentIndex+1]?.title}</>,
				onClick: onPrevious,
				disabled: currentIndex >= episodes.length - 1
			}}
			next={{
				value: <>{episodes[currentIndex-1]?.title}<SkipNextIcon /></>,
				onClick: onNext,
				disabled: currentIndex <= 0
			}}
		/>, [onPrevious, onNext, currentIndex, episodes.length])

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Header />
			<Box sx={{ margin: 2 }}>
				<PodcastInput url={url} setUrl={setUrl} deleteUrl={deleteUrl} podcasts={podcasts} />
				{podcast && <>
					<EpisodeList episodes={episodes} selectedEpisodeId={selectedEpisodeId} setSelectedEpisodeId={setSelectedEpisodeId} />
					{selectedEpisode &&
						<EpisodePreview
							episode={selectedEpisode}
							ShareButton={<ShareButtons url={shareUrl} channel={podcast} episode={selectedEpisode} />}
							Navigator={Navigator}
						/>}
					<PodcastPreview podcast={podcast} ShareButton={<ShareButtons url={shareUrl} channel={podcast} />} />
				</>}
			</Box>
		</ThemeProvider>
	);
};

export default App;
