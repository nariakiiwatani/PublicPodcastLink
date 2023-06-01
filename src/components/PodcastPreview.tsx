import React, { useMemo } from 'react';
import { Podcast } from '../types/podcast';
import { Typography, Card, CardContent, CardMedia, Box, Grid, CardHeader, Link } from '@mui/material'
import { avoidXSS } from '../utils/escape';
import { OpenInNewButton } from './OpenInNewButton';
import { ShareButtons } from './ShareButtons'
import { RelatedLinks } from '../hooks/useRelatedLinks';
import { useEditableChannel } from '../hooks/useChannelSharedWith';
import { useLocation } from 'react-router-dom';

type PodcastPreviewProps = {
	podcast: Podcast | null;
};

export const Title: React.FC<PodcastPreviewProps> = ({ podcast: src }) => {
	if (!src) return null;
	return (<>
		<Typography
				variant='h5'
			>{src.title}<OpenInNewButton url={src.link} />
			</Typography>
			<Typography
				variant='subtitle1'
			>{src.author}
			</Typography>
	</>)
}

export const Thumbnail: React.FC<PodcastPreviewProps> = ({ podcast: src }) => {
	if (!src) return null;
	return (<CardMedia
		component="img"
		image={src.imageUrl}
		alt={src.title}
		sx={{ width: 180, height: 180, borderRadius: '50%' }}
	/>)
}

export const Description: React.FC<PodcastPreviewProps> = ({ podcast: src }) => {
	if(!src) return null
	const safeDescription = useMemo(() => avoidXSS(src.description), [src.description])
	return (<Typography
		variant="subtitle1"
		color="text.secondary"
		style={{
			whiteSpace: 'pre-wrap',
			overflowWrap: 'break-word',
			wordBreak: 'break-all',
		}}
		dangerouslySetInnerHTML={{ __html: safeDescription }}
	/>)
}

const PodcastPreview: React.FC<PodcastPreviewProps> = ({ podcast: src }) => {
	if (!src) return null;

	const path = useLocation()

	const { check } = useEditableChannel()
	const login_link_text = useMemo(() => {
		if(check(src.self_url)) return 'edit'
		return 'owner?'
	}, [src, check])

	return (
		<Card sx={{ marginTop: 2, borderRadius: 2 }}>
			<CardHeader
				title={<Title podcast={src} />}
				style={{ textAlign: 'center' }}
			/>
			<Grid container direction="row" justifyContent="center" alignItems="flex-start">
				<Grid item xs={12} sm={4} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
					<Thumbnail podcast={src} />
					<Box sx={{ marginTop: 1 }}>
						<ShareButtons channel={src} />
					</Box>
					<Box sx={{
						maxWidth: '80%',
						marginTop: 1,
						display:'flex', flexDirection:'row', flexWrap: 'wrap',
						justifyContent: 'center',
						alignContent: 'flex-start'
					}}>
						<RelatedLinks />
					</Box>
					<Link href={`/owner?channel=${src.self_url}`} target='_blank'>{login_link_text}</Link>
				</Grid>
				<Grid item xs={12} sm={8}>
					<CardContent style={{ flex: '1 0 auto' }}>
						<Box style={{ overflowY: 'scroll', maxHeight: 'calc(100% - 30px)' }}>
							<Description podcast={src} />
						</Box>
					</CardContent>
				</Grid>
			</Grid>
		</Card>
	);
};

export default PodcastPreview;
