import { IconButton, Link, Tooltip } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type OpenInNewButtonProps = {
	url: string
}
export const OpenInNewButton = ({
	url: shareUrl,
}: OpenInNewButtonProps) => {
	return (
		<Tooltip title='Open in New Tab'>
			<IconButton color="inherit" component={Link} target="_blank" href={shareUrl}>
				<OpenInNewIcon />
			</IconButton>
		</Tooltip>
	)
}
