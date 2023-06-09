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

const theme = createTheme({
	palette: {
		mode: 'light',
	},
});

const App: React.FC = () => {
	const { t } = useTranslation()

	const query = useQuery();
	const is_playlist = useMemo(() => query.get('view') === 'playlist', [query])

	const import_channels = useMemo(() => query.get('channels')?.split(','), [query])
	const import_dialog = useDialog()
	useEffect(() => {
		if(!import_channels) {
			return
		}
		import_dialog.open()
	}, [import_channels])

	const { podcast, episode, fetch_rss, Input:PodcastInput, Select:EpisodeSelect, Navigator, progress:nextEpisode } = useEpisodeSelect()
	const audioRef = useRef<HTMLAudioElement>(null)
	const handleAudioEnded = useCallback(() => {
		if(!audioRef.current) return
		if(audioRef.current.autoplay) {
			nextEpisode(1)
		}
	}, [audioRef.current, nextEpisode])
	useEffect(() => {
		if(!audioRef.current) return
		audioRef.current.onended = handleAudioEnded
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
		const is_playlist = /\/playlist\/[^/]+\/rss/.test(podcast.self_url)
		const permalink = createPermalink(podcast.self_url, {
			item_id: episode?.id,
			base_url:'/',
			is_playlist
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
						<EpisodeSelect />
						{episode &&
							<EpisodePreview
								channel={podcast}
								episode={episode}
								Navigator={<Navigator swap={is_playlist} />}
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
