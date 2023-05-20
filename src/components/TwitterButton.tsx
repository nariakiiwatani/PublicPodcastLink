import { IconButton, Link } from "@mui/material";
import TwitterIcon from '@mui/icons-material/Twitter';
import { Episode, Podcast } from '../types/podcast';
import Tooltip from '@mui/material/Tooltip';

function extractHashtags(text: string) {
	let regex = /#(?![0-9])[\p{L}\p{N}_]+/gu;
	let hashtags = text.match(regex);
	if (hashtags) {
		return [...new Set(hashtags)];
	}
	return [];
}
type TweetButtonProps = {
	url: string
	channel: Podcast
	episode?: Episode
}
export const TweetButton = ({
	url:shareUrl,
	channel,
	episode,
}: TweetButtonProps) => {
	const hashtags = extractHashtags([
		channel.description,
		episode?.description ?? '',
		'#PublicPodcastLink'].join(' '))
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
		<Tooltip title='Share with Twitter'>
			<IconButton color="inherit" component={Link} target="_blank" href={twitterShareUrl}>
				<TwitterIcon />
			</IconButton>
		</Tooltip>
	)
}
