import { IconButton, Link } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type OpenInNewButtonProps = {
	url: string
}
export const OpenInNewButton = ({
	url: shareUrl,
}: OpenInNewButtonProps) => {
	return (
		<IconButton color="inherit" component={Link} target="_blank" href={shareUrl}>
			<OpenInNewIcon />
		</IconButton>
	)
}
