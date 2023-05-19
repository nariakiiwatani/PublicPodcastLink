import React from 'react';
import { Episode } from '../types/podcast';
import { Typography, Link, Card, CardContent, Box } from '@mui/material'

type EpisodePreviewProps = {
	episode: Episode | null;
	ShareButton?: React.ReactNode;
};

const EpisodePreview: React.FC<EpisodePreviewProps> = ({ episode: src, ShareButton }) => {
	if (!src) return null;

	return (
		<Card style={{ display: 'flex', marginTop: 20, maxHeight: '50vh' }}>
			<Box>
				<img
					src={src.imageUrl}
					alt={src.title}
					style={{
						width: 140,
						objectFit: 'contain',
					}}
				/>
			</Box>
			<CardContent>
				<Box style={{ display: 'flex', alignItems: 'center' }}>
					<Typography component="h5" variant="h5">
						<Link href={src.link} target='_blank'>
							{src.title}
						</Link>
					</Typography>
					{ShareButton}
				</Box>
				<audio controls key={src.audioUrl} style={{ width: '100%', marginTop: 15 }}>
					<source src={src.audioUrl} type="audio/mpeg" />
					Your browser does not support the audio element.
				</audio>
				<Box style={{overflowY: 'scroll', maxHeight: '100%'}}>
					<Typography variant="subtitle1" color="text.secondary" dangerouslySetInnerHTML={{ __html: src.description }} />
				</Box>
			</CardContent>
		</Card>
	);
};

export default EpisodePreview;
