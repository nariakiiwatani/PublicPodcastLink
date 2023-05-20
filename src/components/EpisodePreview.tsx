import React from 'react';
import { Episode } from '../types/podcast';
import { Typography, Link, Grid } from '@mui/material'

type EpisodePreviewProps = {
	episode: Episode | null;
	ShareButton?: React.ReactNode;
	Navigator?: React.ReactNode;
};

const EpisodePreview: React.FC<EpisodePreviewProps> = ({ episode: src, ShareButton, Navigator }) => {
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
					{ShareButton}
				</Grid>
			</Grid>
			<Grid item xs={12} md={8}>
				<Typography variant="h5">
					<Link href={src.link} target='_blank'>
						{src.title}
					</Link>
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
				<Typography variant="subtitle1" color="text.secondary" dangerouslySetInnerHTML={{ __html: src.description }} />
			</Grid>
			<Grid item xs={12}>
				{Navigator}
			</Grid>
		</Grid>
	);
};

export default EpisodePreview;
