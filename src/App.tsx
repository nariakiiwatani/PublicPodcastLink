import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import PodcastPreview from './components/PodcastPreview';
import EpisodePreview from './components/EpisodePreview';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import Header from './components/Header';
import { permalink as createPermalink, importlink as createImportLink } from './utils/permalink';
import { MyHelmet } from './components/MyHelmet';
import { RelatedLinksProvider } from './hooks/useRelatedLinks';
import { useQuery } from './hooks/useQuery'
import { FollowingProvider } from './hooks/useFollows'
import { useDialog } from './hooks/useDialog';
import { ImportChannels } from './components/CreateImportURL';
import { useTranslation } from './hooks/useTranslation';
import { useEpisodeSelect } from './hooks/useEpisodeSelect';
import { usePlaybackRate } from './hooks/useAudioSettings';

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

	const { podcast, episode, episodes, fetch_rss, Input:PodcastInput, OrderSelect, Select:EpisodeSelect, Navigator, next, prev } = useEpisodeSelect()
	const audioRef = useRef<HTMLAudioElement>(null)
	const [playback_rate, setPlaybackRate] = usePlaybackRate(podcast?.self_url)
	const handleRateChange = useCallback(() => {
		if(!audioRef.current) return
		setPlaybackRate(audioRef.current.playbackRate)
	}, [audioRef.current, setPlaybackRate])
	useEffect(() => {
		if(!audioRef.current) return
		audioRef.current.playbackRate = playback_rate
	}, [episode, audioRef.current])
	useEffect(() => {
		if(!audioRef.current) return
		audioRef.current.onratechange = handleRateChange
		return () => {
			if(!audioRef.current) return
			audioRef.current.onratechange = ()=>{}
		}
	}, [audioRef.current, handleRateChange])

	const handleAudioEnded = useCallback(() => {
		if(!audioRef.current) return
		if(audioRef.current.autoplay) {
			audioRef.current.load()
			next()
		}
	}, [audioRef.current, next, episodes])
	useEffect(() => {
		if(!audioRef.current) return
		audioRef.current.onended = handleAudioEnded
		return () => {
			if(!audioRef.current) return
			audioRef.current.onended = ()=>{}
		}
	}, [audioRef.current, handleAudioEnded])

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
			let guid = query.get('item')
			if(guid) guid = decodeURIComponent(guid)
			return fetch_rss(decodeURIComponent(url), guid)
		}
	}, [])

	useEffect(() => {
		if(!podcast) {
			return
		}
		const permalink = createPermalink(podcast.self_url, {
			item_id: episode?.id,
			base_url:'/'
		})
		navigate(permalink)
	}, [podcast, episode]);


	return (
		<ThemeProvider theme={theme}>
			<FollowingProvider>
				<CssBaseline />
				<MyHelmet podcast={podcast} episode={episode} />
				<Header />
				<Box sx={{ margin: 2 }}>
					<PodcastInput deletable={true} />
					{podcast && <>
						<Box sx={{display:'flex', flexDirection:'row'}}>
							<EpisodeSelect />
							<OrderSelect label='並べ替え' />
						</Box>
						{episode &&
							<EpisodePreview
								channel={podcast}
								episode={episode}
								Navigator={<Navigator />}
								audioRef={audioRef}
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
