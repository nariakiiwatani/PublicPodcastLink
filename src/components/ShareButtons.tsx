import { Grid } from '@mui/material'
import { useMemo } from 'react'
import { Podcast, Episode } from '../types/podcast'
import { CopyToClipboardButton } from './CopyToClipboardButton'
import { TweetButton } from './TwitterButton'
import { permalink as createPermalink } from '../utils/permalink';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import { useQuery } from '../hooks/useQuery'

type ShareProps = {
	channel: Podcast
	episode?: Episode
}
export const ShareButtons = (props: ShareProps) => {
	const { channel:{self_url:rss_url}, episode } = props
	const query = useQuery();
	const is_playlist = useMemo(() => query.get('view') === 'playlist', [query])

	const permalink = useMemo(() => createPermalink(rss_url, {
		item_id:episode?.id,
		is_playlist
	}), [rss_url, episode, is_playlist])
	
	return (<Grid container direction='row'>
		<CopyToClipboardButton {...props} value={rss_url} Icon={<RssFeedIcon />} />
		<TweetButton {...props} url={permalink} />
		<CopyToClipboardButton {...props} value={permalink} Icon={<FileCopyOutlinedIcon />} />
	</Grid>)
}
