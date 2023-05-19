import React, { useMemo } from 'react';
import { Podcast } from '../types/podcast';
import { Typography, Link, Card, CardContent, CardMedia, Box } from '@mui/material'
import { avoidXSS } from '../utils/escape';

type PodcastPreviewProps = {
	podcast: Podcast | null;
	ShareButton?: React.ReactNode;
};

const PodcastPreview: React.FC<PodcastPreviewProps> = ({ podcast: src, ShareButton }) => {
	if (!src) return null;

	const safeDescription = useMemo(() => avoidXSS(src.description), [src.description])

	return (
		<Card style={{ display: 'flex', marginTop: 20, maxHeight: '25vh' }}>
			<CardMedia
				component="img"
				width="140"
				height="140"
				image={src.imageUrl}
				alt={src.title}
				sx={{ width: 140, height: 140 }}
			/>
			<CardContent style={{ flex: '1 0 auto', maxWidth: 'calc(100% - 140px)' }}>
				<Box style={{ display: 'flex', alignItems: 'center' }}>
					<Typography component="h5" variant="h5">
						<Link href={src.link} target='_blank'>
							{src.title}
						</Link>
					</Typography>
					{ShareButton}
				</Box>
				<Box style={{overflowY: 'scroll', maxHeight: 'calc(100% - 30px)'}}>
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
				</Box>
			</CardContent>
		</Card>
	);
};

export default PodcastPreview;
