
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Link, Box, MenuItem, Select, SelectChangeEvent, Menu, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslation } from '../hooks/useTranslation'

const Header = () => {
	const { locale, changeLanguage, t } = useTranslation('header')
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleChangeLanguage = (event: SelectChangeEvent<string>) => {
		changeLanguage(event.target.value)
	}
	const theme = useTheme()
	const is_small_screen = useMediaQuery(theme.breakpoints.down('sm'))

	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLinkItemClick = (url: string, target: string='_blank') => () => {
		window.open(url, target)
		handleMenuClose();
	};

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

				<IconButton
					size='medium'
					color="inherit"
					aria-label="menu"
					onClick={handleMenuOpen}
				>
					<MenuIcon />
				</IconButton>

				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
				>
					<MenuItem onClick={handleLinkItemClick('https://github.com/nariakiiwatani/InstantPodcastPlayer')}>
						<ListItemIcon>
							<GitHubIcon />
						</ListItemIcon>
						<ListItemText primary="GitHub" />
					</MenuItem>

					<MenuItem onClick={handleLinkItemClick('https://twitter.com/nariakiiwatani')}>
						<ListItemIcon>
							<TwitterIcon />
						</ListItemIcon>
						<ListItemText primary="Twitter" />
					</MenuItem>

					<MenuItem onClick={handleLinkItemClick(t.donation.url)}>
						<ListItemIcon>
							<VolunteerActivismIcon />
						</ListItemIcon>
						<ListItemText primary={t.donation.label} />
					</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
}

export default Header;
