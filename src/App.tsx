import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'
import PodcastInput from './components/PodcastInput';
import PodcastPreview from './components/PodcastPreview';
import EpisodeList from './components/EpisodeList';
import EpisodePreview from './components/EpisodePreview';
import usePodcast from './hooks/usePodcast';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import Header from './components/Header';
import { permalink as createPermalink } from './utils/permalink';
import { NavigatorButtons } from './components/NavigatorButtons';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { useAsync } from 'react-use';
import { MyHelmet } from './components/MyHelmet';
import { RelatedLinksProvider } from './hooks/useRelatedLinks';
import { useQuery } from './hooks/useQuery'
import { FollowingProvider } from './hooks/useFollows'

const theme = createTheme({
	palette: {
		mode: 'light',
	},
});

const App: React.FC = () => {
	const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
	const { podcast, episodes, fetchPodcast } = usePodcast();

	const navigate = useNavigate()

	const query = useQuery();

	const handleUrlInput = (value: string) => {
		try {
			const url = new URL(value)
			updateSelected(url.toString(), null)
		}
		catch(e) {
			console.error(e)
		}
	}

	useAsync(async () => {
		const url = query.get('channel')??query.get('channels')
		if (url) {
			const list = url.split(',')
			await Promise.all(list.map(url => {
				let guid = query.get('item')
				url = decodeURIComponent(url)
				if (guid) guid = decodeURIComponent(guid)
				return updateSelected(url, guid)
			}))
		}
	}, [])

	useEffect(() => {
		if(!podcast) {
			navigate('/')
			return
		}
		const permalink = createPermalink(podcast.self_url, selectedEpisodeId || undefined, '/')
		navigate(permalink)
	}, [podcast, selectedEpisodeId]);

	const updateSelected = useCallback((url: string, episode_id: string | null) => {
		return fetchPodcast(url).then((result) => {
			if (result) {
				const { episodes: epi } = result
				if (epi.length > 0) {
					if (episode_id && epi.find(({ id }: { id: string }) => id === episode_id)) {
						setSelectedEpisodeId(episode_id)
					}
					else {
						setSelectedEpisodeId(null)
					}
				}
			}
		});
	}, [fetchPodcast])

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

	const Navigator = useMemo(() =>
		<NavigatorButtons
			prev={{
				value: <><SkipPreviousIcon />{episodes[currentIndex + 1]?.title}</>,
				onClick: onPrevious,
				disabled: currentIndex >= episodes.length - 1
			}}
			next={{
				value: <>{episodes[currentIndex - 1]?.title}<SkipNextIcon /></>,
				onClick: onNext,
				disabled: currentIndex <= 0
			}}
		/>, [onPrevious, onNext, currentIndex, episodes.length])

	return (
		<ThemeProvider theme={theme}>
			<FollowingProvider>
				<CssBaseline />
				<MyHelmet podcast={podcast} episode={selectedEpisode} />
				<Header />
				<Box sx={{ margin: 2 }}>
					<PodcastInput setUrl={handleUrlInput} />
					{podcast && <>
						<EpisodeList episodes={episodes} selectedEpisodeId={selectedEpisodeId} setSelectedEpisodeId={setSelectedEpisodeId} />
						{selectedEpisode &&
							<EpisodePreview
								channel={podcast}
								episode={selectedEpisode}
								Navigator={Navigator}
							/>}
						<RelatedLinksProvider url={podcast.self_url}>
							<PodcastPreview podcast={podcast}/>
						</RelatedLinksProvider>
					</>}
				</Box>
			</FollowingProvider>
		</ThemeProvider>
	);
};

export default App;
