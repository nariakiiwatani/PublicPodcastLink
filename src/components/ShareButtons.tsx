import { Grid, IconButton, Link } from '@mui/material'
import { useMemo } from 'react'
import { Podcast, Episode } from '../types/podcast'
import { CopyToClipboardButton } from './CopyToClipboardButton'
import { TweetButton } from './TwitterButton'
import { permalink as createPermalink } from '../utils/permalink';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type ShareProps = {
	channel: Podcast
	episode?: Episode
}
export const ShareButtons = (props: ShareProps) => {
	const { channel:{self_url:rss_url, link: channel_link}, episode } = props

	const permalink = useMemo(() => createPermalink(rss_url, {
		item_id:episode?.id,
	}), [rss_url, episode])

	const original_link = episode ? episode.link : channel_link
	
	return (<Grid container direction='row'>
		<CopyToClipboardButton {...props} value={rss_url} Icon={<RssFeedIcon />} />
		<TweetButton {...props} url={permalink} />
		<CopyToClipboardButton {...props} value={permalink} Icon={<FileCopyOutlinedIcon />} />
		<IconButton
			color="inherit"
			component={Link} href={original_link} target='_blank'
		>
			<OpenInNewIcon />
		</IconButton>
	</Grid>)
}
