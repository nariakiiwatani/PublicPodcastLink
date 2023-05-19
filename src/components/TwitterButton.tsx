import { IconButton, Link } from "@mui/material";
import TwitterIcon from '@mui/icons-material/Twitter';
import { shareUrl as createShareUrl } from '../utils/permalink';
import { Episode, Podcast } from '../types/podcast';

function extractHashtags(text: string) {
	let regex = /#(?![0-9])[\p{L}\p{N}_]+/gu;
    let hashtags = text.match(regex);
    if (hashtags) {
		return [...new Set(hashtags)];
    }
    return [];
}
type TweetButtonProps = {
	rss_url: string
	channel: Podcast
	episode?: Episode
}
export const TweetButton = ({
	rss_url,
	channel,
	episode,
}: TweetButtonProps) => {
	const shareUrl = createShareUrl(rss_url, episode?.id)
	const hashtags = extractHashtags([
		channel.description,
		episode?.description??'',
		'#InstantPodcastPlayer'].join(' '))
	const message = episode ?
`${channel.title}
${episode.title}
${hashtags.join(' ')}
${shareUrl}` :
`${channel.title}
${hashtags.join(' ')}
${shareUrl}`

	const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
	return (
		<IconButton color="inherit" component={Link} target="_blank" href={twitterShareUrl}>
			<TwitterIcon />
		</IconButton>
	)
}
