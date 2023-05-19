import { IconButton, Link } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { shareUrl as createShareUrl } from '../utils/permalink';
import { Episode } from '../types/podcast';

type OpenInNewButtonProps = {
	rss_url: string
	episode?: Episode
}
export const OpenInNewButton = ({
	rss_url,
	episode,
}: OpenInNewButtonProps) => {
	const shareUrl = createShareUrl(rss_url, episode?.id)
	return (
		<IconButton color="inherit" component={Link} target="_blank" href={shareUrl}>
			<OpenInNewIcon />
		</IconButton>
	)
}
