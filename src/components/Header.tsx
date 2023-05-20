import { AppBar, Toolbar, Typography, IconButton, Link, Box, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useTranslation } from '../hooks/useTranslation'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Tooltip from '@mui/material/Tooltip';
import { useMediaQuery, useTheme } from '@mui/material';

const IconLinkButton = ({ url, children }: {
	url: string,
	children: React.ReactNode
}) => {
	const theme = useTheme()
	const is_small_screen = useMediaQuery(theme.breakpoints.down('sm'))
	return (
		<IconButton
			size={is_small_screen ? 'small' : 'medium'}
			color="inherit"
			target="_blank"
			component={Link}
			href={url}
		>
			{children}
		</IconButton>
	)

}

const Header = () => {
	const { locale, changeLanguage, t } = useTranslation('header')
	const handleChangeLanguage = (event: SelectChangeEvent<string>) => {
		changeLanguage(event.target.value)
	}
	const theme = useTheme()
	const is_small_screen = useMediaQuery(theme.breakpoints.down('sm'))
	return (
		<AppBar position="static">
			<Toolbar>
				<Link href={window.origin} sx={{ flexGrow: 1 }}>
					<Typography color='white' variant="h6" component="div">
						PublicPodcast.link
					</Typography>
				</Link>
				<Box>
					<Select
						size='small'
						value={locale}
						onChange={handleChangeLanguage}
					>
						<MenuItem value="en">🇺🇸{!is_small_screen && ' English'}</MenuItem>
						<MenuItem value="ja">🇯🇵{!is_small_screen && ' 日本語'}</MenuItem>
					</Select>
				</Box>

				<IconLinkButton
					url='https://github.com/nariakiiwatani/InstantPodcastPlayer'
				>
					<Tooltip title='GitHub'><GitHubIcon /></Tooltip>
				</IconLinkButton>


				<IconLinkButton
					url='https://twitter.com/nariakiiwatani'
				>
					<Tooltip title='Twitter'><TwitterIcon /></Tooltip>
				</IconLinkButton>
				<IconLinkButton
					url={t.donation.url}
				>
					<Tooltip title={t.donation.label}>
						<VolunteerActivismIcon />
					</Tooltip>
				</IconLinkButton>

			</Toolbar>
		</AppBar>
	);
}

export default Header;
