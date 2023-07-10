import React, { useMemo } from 'react';
import { Podcast, Episode } from '../types/podcast';
import { Typography, Grid, Checkbox, FormControlLabel } from '@mui/material'
import { OpenInNewButton } from './OpenInNewButton';
import { ShareButtons } from './ShareButtons';
import { useAutoPlay } from '../hooks/useAudioSettings';
import { avoidXSS } from '../utils/escape';

type EpisodePreviewProps = {
	channel: Podcast
	episode: Episode | null;
	Navigator?: React.ReactNode;
	mediaElement: HTMLAudioElement|HTMLVideoElement|null
	MediaPlayer: React.ReactNode
};

const EpisodePreview: React.FC<EpisodePreviewProps> = ({ channel, episode: src, Navigator, mediaElement, MediaPlayer }) => {

	const { autoPlay, set:setAutoPlay } = useAutoPlay()
	const handleChangeAutoPlay = (is_autoplay: boolean) => {
		setAutoPlay(is_autoplay)
		if(mediaElement) {
			mediaElement.autoplay = is_autoplay
		}
	}
	const safeDescription = useMemo(() => src?avoidXSS(src.description):'', [src?.description])

	if (!src) return null;
	return (
		<Grid container spacing={1} marginTop={2} columns={{xs:12, md:18}} justifyContent={'center'}>
			<Grid item xs={12} md={2} container>
				<Grid item xs={12}>
					<img
						src={src.imageUrl}
						alt={src.title}
						style={{
							width: '100%',
							objectFit: 'contain',
						}}
					/>
				</Grid>
				<Grid item xs={12}>
					<ShareButtons channel={channel} episode={src} />
				</Grid>
			</Grid>
			<Grid item xs={12} md={8} sx={{position:'relative'}}>
				<Typography variant="subtitle2">
					{new Date(src.pubDate).toLocaleString()}
				</Typography>
				<Typography variant="h5">
					{src.title}<OpenInNewButton url={src.link} />
				</Typography>
				<Typography variant="subtitle1">
					{channel?.title}
				</Typography>
				<FormControlLabel
					sx={{ position: 'absolute', right: 0, bottom: 0 }}
					control={
						<Checkbox checked={autoPlay} onChange={(e)=>handleChangeAutoPlay(e.target.checked)} />
					}
					label="自動再生"
				/>
			</Grid>
			<Grid item xs={12}>
				{MediaPlayer}
			</Grid>
			<Grid item xs={12}>
				{Navigator}
			</Grid>
			<Grid item xs={12}>
				<Typography
					variant="subtitle1"
					color="text.secondary"
					style={{
						whiteSpace: 'pre-wrap',
						overflowWrap: 'break-word',
						wordBreak: 'break-all',
					}}
					dangerouslySetInnerHTML={{ __html: safeDescription }}
				/>
			</Grid>
			<Grid item xs={12}>
				{Navigator}
			</Grid>
		</Grid>
	);
};

export default EpisodePreview;
