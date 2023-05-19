import { IconButton, Link } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { shareUrl as createShareUrl } from '../utils/permalink';
import { Episode } from '../types/podcast';
import Tooltip from '@mui/material/Tooltip';

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
		<Tooltip title='Open In New Window'>
			<IconButton color="inherit" component={Link} target="_blank" href={shareUrl}>
				<OpenInNewIcon />
			</IconButton>
		</Tooltip>
	)
}
