import React, { useMemo } from 'react';
import { Podcast } from '../types/podcast';
import { Typography, Card, CardContent, CardMedia, Box, Grid, CardHeader } from '@mui/material'
import { avoidXSS } from '../utils/escape';
import { OpenInNewButton } from './OpenInNewButton';

type PodcastPreviewProps = {
	podcast: Podcast | null;
	ShareButton?: React.ReactNode;
};

const PodcastPreview: React.FC<PodcastPreviewProps> = ({ podcast: src, ShareButton }) => {
	if (!src) return null;

	const safeDescription = useMemo(() => avoidXSS(src.description), [src.description])

	return (
		<Card sx={{ marginTop: 2, borderRadius: 2 }}>
			<CardHeader
				title={<p>{src.title}<OpenInNewButton url={src.link} /></p>}
				style={{ textAlign: 'center' }}
			/>
			<Grid container direction="row" justifyContent="center" alignItems="flex-start">
				<Grid item xs={12} sm={4} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
					<CardMedia
						component="img"
						image={src.imageUrl}
						alt={src.title}
						sx={{ width: 180, height: 180, borderRadius: '50%' }}
					/>
					<Box style={{ marginTop: 10 }}>
						{ShareButton}
					</Box>
				</Grid>
				<Grid item xs={12} sm={8}>
					<CardContent style={{ flex: '1 0 auto' }}>
						<Box style={{ overflowY: 'scroll', maxHeight: 'calc(100% - 30px)' }}>
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
				</Grid>
			</Grid>
		</Card>
	);
};

export default PodcastPreview;
