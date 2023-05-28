import React from 'react';
import { Podcast, Episode } from '../types/podcast';
import { Typography, Grid } from '@mui/material'
import { OpenInNewButton } from './OpenInNewButton';
import { ShareButtons } from './ShareButtons';

type EpisodePreviewProps = {
	channel: Podcast
	episode: Episode | null;
	Navigator?: React.ReactNode;
};

const EpisodePreview: React.FC<EpisodePreviewProps> = ({ channel, episode: src, Navigator }) => {
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
			<Grid item xs={12} md={8}>
				<Typography variant="subtitle2">
					{new Date(src.pubDate).toLocaleString()}
				</Typography>
				<Typography variant="h5">
					{src.title}<OpenInNewButton url={src.link} />
				</Typography>
				<Typography variant="subtitle1">
					{channel?.title}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<audio controls key={src.audioUrl} style={{ width: '100%', marginTop: 5 }}>
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
