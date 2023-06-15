import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import PodcastPreview from './components/PodcastPreview';
import EpisodePreview from './components/EpisodePreview';
import { CssBaseline, ThemeProvider, createTheme, Box, SelectChangeEvent } from '@mui/material';
import Header from './components/Header';
import { permalink as createPermalink, importlink as createImportLink } from './utils/permalink';
import { MyHelmet } from './components/MyHelmet';
import { RelatedLinksProvider } from './hooks/useRelatedLinks';
import { useQuery } from './hooks/useQuery'
import { FollowingProvider } from './hooks/useFollows'
import { useDialog } from './hooks/useDialog';
import { ImportChannels } from './components/CreateImportURL';
import { useTranslation } from './hooks/useTranslation';
import { usePlaybackRate } from './hooks/useAudioSettings';
import { useTrackControl } from './hooks/useTrackControl';
import { Navigator } from './components/Navigator'
import usePodcast from './hooks/usePodcast';
import PodcastInput from './components/PodcastInput';
import { EpisodeSelect } from './components/EpisodeList';
import { OrderEpisode } from './components/OrderEpisode';
import { Episode } from './types/podcast'

const theme = createTheme({
	palette: {
		mode: 'light',
	},
});

const App: React.FC = () => {
	const { t } = useTranslation()

	const query = useQuery();

	const import_channels = useMemo(() => query.get('channels')?.split(','), [query])
	const import_dialog = useDialog()
	useEffect(() => {
		if(!import_channels) {
			return
		}
		import_dialog.open()
	}, [import_channels])

	const [episode_order, setEpisodeOrder] = useState<'listed' | 'date_asc' | 'date_desc'>('listed')
	const { podcast, episodes, fetchPodcast } = usePodcast(undefined, { order_by: episode_order });

	const handleLoadEpisode = (track: Episode | null) => {
		if(!podcast || !track || !audioElement) return
		audioElement.src = track.audioUrl
		if(audioElement.autoplay) {
			audioElement.play().catch(error => {
				console.error('Error during play:', error);
			});
		}
		const permalink = createPermalink(podcast.self_url, {
			item_id: track?.id,
			base_url:'/'
		})
		navigate(permalink)
	}

	const {
		track: episode,
		index: currentIndex,
		next,
		prev,
		set: setCurrentEpisodeById,
		clear: clearEpisode
	} = useTrackControl(episodes, handleLoadEpisode)

	const handleSelectPodcast = (url: string) => {
		clearEpisode()
		return fetchPodcast(url)
	}

	const handleChangeOrder = (e: SelectChangeEvent) => {
		const v = e.target.value
		if (v === 'listed' || v === 'date_asc' || v === 'date_desc') {
			setEpisodeOrder(v)
		}
	}

	const [playback_rate, setPlaybackRate] = usePlaybackRate(podcast?.self_url)
	const [audioElement, setAudioElement] = useState<HTMLAudioElement|null>(null)
	
	useEffect(() => {
		if(!audioElement) return
		audioElement.playbackRate = playback_rate
	}, [episode, audioElement])
	useEffect(() => {
		if(!audioElement) return
		audioElement.onratechange = () => {
			setPlaybackRate(audioElement.playbackRate)
		}
		return () => {
			audioElement.onratechange = ()=>{}
		}
	}, [audioElement])

	useEffect(() => {
		if(!audioElement) return
		audioElement.onended = () => {
			if(audioElement.autoplay) {
				audioElement.load()
				next && next()
			}
		}
		return () => {
			audioElement.onended = ()=>{}
		}
	}, [audioElement, next])

	const navigate = useNavigate()

	useEffect(() => {
		const url = query.get('channel')
		if (url) {
			const list = url.split(',')
			if(list.length > 1) {
				navigate(createImportLink(list, {
					base_url:'/'
				}))
				return
			}
			fetchPodcast(decodeURIComponent(url))
			.then(result => {
				if(!result) return
				let guid = query.get('item')
				if(guid) {
					setCurrentEpisodeById(decodeURIComponent(guid))
				}
			})
		}
	}, [])

	useEffect(() => {
		if (!podcast || !episode || !audioElement) return
		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: episode.title,
				artist: podcast.author,
				album: podcast.title,
				artwork: [{
					src: episode.imageUrl,
				}],
			});

			navigator.mediaSession.setActionHandler('previoustrack', () => {
				if(prev && audioElement.currentTime < 3) {
					prev()
				}
				else {
					audioElement.currentTime = 0
				}
			});
			navigator.mediaSession.setActionHandler('nexttrack', next);
			navigator.mediaSession.setActionHandler('seekto', (details: MediaSessionActionDetails) => {
				if(!audioElement || details.seekTime === undefined) return
				audioElement.currentTime = details.seekTime
			});
			navigator.mediaSession.setActionHandler('play', async () => {
				await audioElement.play()
			});
			navigator.mediaSession.setActionHandler('pause', () => {
				audioElement.pause();
			});
		}
		return () => {
			if ('mediaSession' in navigator) {
				navigator.mediaSession.setActionHandler('previoustrack', null);
				navigator.mediaSession.setActionHandler('nexttrack', null);
				navigator.mediaSession.setActionHandler('seekto', null);
				navigator.mediaSession.setActionHandler('play', null);
				navigator.mediaSession.setActionHandler('pause', null);
			}
		}
	}, [podcast, episode, audioElement, next, prev]);

	return (
		<ThemeProvider theme={theme}>
			<FollowingProvider>
				<CssBaseline />
				<MyHelmet podcast={podcast} episode={episode} />
				<Header />
				<Box sx={{ margin: 2 }}>
					<PodcastInput option={podcast} setUrl={handleSelectPodcast} deletable={true} />
					{podcast && <>
						<Box sx={{display:'flex', flexDirection:'row'}}>
							<EpisodeSelect episodes={episodes} selected_id={episode?.id??null} onSelect={setCurrentEpisodeById} />
							<OrderEpisode label='並べ替え' value={episode_order} onChange={handleChangeOrder} />
						</Box>
						{episode &&
							<EpisodePreview
								channel={podcast}
								episode={episode}
								Navigator={<Navigator episodes={episodes} index={currentIndex} onPrev={prev} onNext={next} />}
								onAudioChanged={setAudioElement}
							/>}
						<RelatedLinksProvider url={podcast.self_url}>
							<PodcastPreview podcast={podcast}/>
						</RelatedLinksProvider>
					</>}
				</Box>
				{import_channels && <import_dialog.Dialog title={t.import_channels.title}>
					<ImportChannels channels={import_channels} />
				</import_dialog.Dialog>}
			</FollowingProvider>
		</ThemeProvider>
	);
};

export default App;
