import { AppBar, Toolbar, Typography, IconButton, Link, Box, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useTranslation } from '../hooks/useTranslation'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Tooltip from '@mui/material/Tooltip';

const Header = () => {
	const { locale, changeLanguage, t } = useTranslation('header')
	const handleChangeLanguage = (event: SelectChangeEvent<string>) => {
		changeLanguage(event.target.value)
	}
	return (
		<AppBar position="static">
			<Toolbar>
				<Link href={window.origin} sx={{ flexGrow: 1 }}>
					<Typography color='white' variant="h6" component="div">
						PublicPodcast.link
					</Typography>
				</Link>
				<Tooltip title='translation'>
					<Box>
						<Select
							value={locale}
							onChange={handleChangeLanguage}
						>
							<MenuItem value="en">🇺🇸 English</MenuItem>
							<MenuItem value="ja">🇯🇵 日本語</MenuItem>
						</Select>
					</Box>
				</Tooltip>
				<Tooltip title='GitHub'>
					<IconButton color="inherit" target="_blank" component={Link} href="https://github.com/nariakiiwatani/InstantPodcastPlayer">
						<GitHubIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title='Twitter'>
					<IconButton color="inherit" target="_blank" component={Link} href="https://twitter.com/nariakiiwatani">
						<TwitterIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title={t.donation.label}>
					<IconButton color="inherit" target="_blank" component={Link} href={t.donation.url}>
						<VolunteerActivismIcon />
					</IconButton>
				</Tooltip>
			</Toolbar>
		</AppBar>
	);
}

export default Header;
