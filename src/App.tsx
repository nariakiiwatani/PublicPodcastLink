import React, { useState, useEffect, useCallback, useMemo, createContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import PodcastInput from './components/PodcastInput';
import PodcastPreview from './components/PodcastPreview';
import EpisodeList from './components/EpisodeList';
import EpisodePreview from './components/EpisodePreview';
import { TweetButton } from './components/TwitterButton'
import usePodcast from './hooks/usePodcast';
import { CssBaseline, ThemeProvider, createTheme, Box, Grid } from '@mui/material';
import Header from './components/Header';
import { Podcast, Episode } from './types/podcast';
import { permalink as createPermalink } from './utils/permalink';
import { NavigatorButtons } from './components/NavigatorButtons';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { CopyToClipboardButton } from './components/CopyToClipboardButton';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import { useAsync } from 'react-use';
import { MyHelmet } from './components/MyHelmet';

const theme = createTheme({
	palette: {
		mode: 'light',
	},
});

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

type ShareProps = {
	rss_url: string
	channel: Podcast
	episode?: Episode
}
const ShareButtons = (props: ShareProps) => {
	const { rss_url, episode } = props
	const permalink = useMemo(() => createPermalink(rss_url, episode?.id), [rss_url, episode])
	
	return (<Grid container direction='row'>
		<CopyToClipboardButton {...props} value={rss_url} Icon={<RssFeedIcon />} />
		<TweetButton {...props} url={permalink} />
		<CopyToClipboardButton {...props} value={permalink} Icon={<FileCopyOutlinedIcon />} />
	</Grid>)
}

type PodcastRecord = { url: string, title: string }

export const PodcastRecordContext = createContext<PodcastRecord[]>([])

const App: React.FC = () => {
	const [podcasts, setPodcasts] = useState<PodcastRecord[]>(JSON.parse(localStorage.getItem('podcasts') ?? '[]'));
	const [url, setUrl_] = useState('');
	const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
	const { podcast, episodes, fetchPodcast, clearPodcast } = usePodcast();

	const navigate = useNavigate()

	const query = useQuery();

	const setUrl = (url: string) => {
		if (!podcasts.find(({ title }) => title === url)) {
			setUrl_(url)
		}
	}

	const deleteUrl = (url: string) => {
		const newPodcasts = [...podcasts]
		let index = newPodcasts.findIndex(p => p.url === url)
		if (index >= 0) {
			newPodcasts.splice(index, 1)
			setPodcasts(newPodcasts)
			index = Math.min(index, newPodcasts.length - 1)
			if (index >= 0) {
				setUrl(newPodcasts[index].url)
			}
			else {
				clearPodcast()
				navigate(`/`)
			}
			localStorage.setItem('podcasts', JSON.stringify(newPodcasts))
		}
	}

	useAsync(async () => {
		const url = query.get('channel')
		if (url) {
			const list = url.split(',')
			await Promise.all(list.map(url => {
				let guid = query.get('item')
				url = decodeURIComponent(url)
				if (guid) guid = decodeURIComponent(guid)
				return updateSelected(url, guid)
			}))
			setUrl(list[0])
		}
	}, [])

	useEffect(() => {
		if (url) {
			updateSelected(url, selectedEpisodeId)
		}
	}, [url]);
	useEffect(() => {
		if (url === '') {
			return
		}
		const permalink = createPermalink(url, selectedEpisodeId || undefined, '/')
		navigate(permalink)
	}, [podcast, selectedEpisodeId]);

	const updateSelected = useCallback((url: string, episode_id: string | null) => {
		return fetchPodcast(url).then((result) => {
			if (result) {
				const { podcast: pod, episodes: epi } = result
				setPodcasts(podcasts => {
					const newPodcasts = [...podcasts]
					const prev = newPodcasts.find(({ url: prev_url }) => url === prev_url)
					if (prev) {
						prev.title = pod.title
					}
					else {
						newPodcasts.push({ url, title: pod.title })
					}
					localStorage.setItem('podcasts', JSON.stringify(newPodcasts));
					return newPodcasts
				});
				if (epi.length > 0) {
					if (episode_id && epi.find(({ id }: { id: string }) => id === episode_id)) {
						setSelectedEpisodeId(episode_id)
					}
					else {
						setSelectedEpisodeId(epi[0].id)
					}
				}
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
			<PodcastRecordContext.Provider value={podcasts}>
				<CssBaseline />
				<MyHelmet podcast={podcast} episode={selectedEpisode} />
				<Header />
				<Box sx={{ margin: 2 }}>
					<PodcastInput url={url} setUrl={setUrl} deleteUrl={deleteUrl} podcasts={podcasts} />
					{podcast && <>
						<EpisodeList episodes={episodes} selectedEpisodeId={selectedEpisodeId} setSelectedEpisodeId={setSelectedEpisodeId} />
						{selectedEpisode &&
							<EpisodePreview
								channel={podcast}
								episode={selectedEpisode}
								ShareButton={<ShareButtons rss_url={url} channel={podcast} episode={selectedEpisode} />}
								Navigator={Navigator}
							/>}
						<PodcastPreview podcast={podcast} ShareButton={<ShareButtons rss_url={url} channel={podcast} />} />
					</>}
				</Box>
			</PodcastRecordContext.Provider>
		</ThemeProvider>
	);
};

export default App;
