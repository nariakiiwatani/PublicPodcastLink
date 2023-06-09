import React from 'react';
import { Podcast, Episode } from '../types/podcast';
import { Typography, Grid, Checkbox, FormControlLabel } from '@mui/material'
import { OpenInNewButton } from './OpenInNewButton';
import { ShareButtons } from './ShareButtons';
import { useAutoPlay } from '../hooks/useAutoPlay';

type EpisodePreviewProps = {
	channel: Podcast
	episode: Episode | null;
	Navigator?: React.ReactNode;
	audioRef?: React.Ref<HTMLAudioElement>
};

const EpisodePreview: React.FC<EpisodePreviewProps> = ({ channel, episode: src, Navigator, audioRef }) => {
	const { autoPlay, set:setAutoPlay } = useAutoPlay()
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
						<Checkbox checked={autoPlay} onChange={(e)=>setAutoPlay(e.target.checked)} />
					}
					label="自動再生"
				/>
			</Grid>
			<Grid item xs={12}>
				<audio controls key={src.audioUrl} style={{ width: '100%', marginTop: 5 }} autoPlay={autoPlay} ref={audioRef}>
					<source src={src.audioUrl} type="audio/mpeg" />
					Your browser does not support the audio element.
				</audio>
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
					dangerouslySetInnerHTML={{ __html: src.description }}
				/>
			</Grid>
			<Grid item xs={12}>
				{Navigator}
			</Grid>
		</Grid>
	);
};

export default EpisodePreview;
