
import React, { useContext, useState, useMemo } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Link, Box, MenuItem, Select, SelectChangeEvent, Menu, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MenuIcon from '@mui/icons-material/Menu';
import ShareIcon from '@mui/icons-material/Share';
import PeopleIcon from '@mui/icons-material/People';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings'
import LockResetIcon from '@mui/icons-material/LockReset';
import { useTranslation } from '../hooks/useTranslation'
import { useDialog } from '../hooks/useDialog';
import { CreateImportURL } from './CreateImportURL';
import Donation from './Donation';
import { SessionContext } from '../utils/supabase';
import { useLocation } from 'react-router-dom';
import { ResetPassword } from './Login';

const Header = () => {
	const { session, logout } = useContext(SessionContext)
	const { locale, changeLanguage, t } = useTranslation('header')
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const path = useLocation()

	const is_dashboard_page = useMemo(() => path.pathname == '/owner', [path])

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

	const handleLinkItemClick = (url: string, target: string = '_blank') => () => {
		window.open(url, target)
		handleMenuClose();
	};

	const handleLogoutItemClick = () => {
		handleMenuClose()
		logout()
	}

	const handlePasswordChange = () => {
		password_dialog.close()
	}

	const export_dialog = useDialog();
	const donation_dialog = useDialog();
	const password_dialog = useDialog();

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
					<MenuItem onClick={export_dialog.open}>
						<ListItemIcon>
							<ShareIcon />
						</ListItemIcon>
						<ListItemText primary={t.export} />
					</MenuItem>

					<MenuItem onClick={handleLinkItemClick(t.donation.url)}>
						<ListItemIcon>
							<VolunteerActivismIcon />
						</ListItemIcon>
						<ListItemText primary={t.donation.label} />
					</MenuItem>

					<MenuItem onClick={donation_dialog.open}>
						<ListItemIcon>
							<PeopleIcon />
						</ListItemIcon>
						<ListItemText primary={t.about_donation} />
					</MenuItem>

					<MenuItem onClick={handleLinkItemClick('https://twitter.com/nariakiiwatani')}>
						<ListItemIcon>
							<TwitterIcon />
						</ListItemIcon>
						<ListItemText primary="Twitter" />
					</MenuItem>

					<MenuItem onClick={handleLinkItemClick('https://github.com/nariakiiwatani/PublicPodcastLink')}>
						<ListItemIcon>
							<GitHubIcon />
						</ListItemIcon>
						<ListItemText primary="GitHub" />
					</MenuItem>
					
					{session && !is_dashboard_page && <MenuItem onClick={handleLinkItemClick(`${window.origin}/owner`)}>
						<ListItemIcon>
							<SettingsIcon />
						</ListItemIcon>
						<ListItemText primary={t.to_dashboard} />
					</MenuItem>}
					{session && <MenuItem onClick={password_dialog.open}>
						<ListItemIcon>
							<LockResetIcon />
						</ListItemIcon>
						<ListItemText primary={t.change_password_title} />
					</MenuItem>}
					{session ? 
					<MenuItem onClick={handleLogoutItemClick}>
						<ListItemIcon>
							<LogoutIcon />
						</ListItemIcon>
						<ListItemText primary={t.logout} />
					</MenuItem> :
					<MenuItem onClick={handleLinkItemClick(`${window.origin}/owner`)}>
						<ListItemIcon>
							<LoginIcon />
						</ListItemIcon>
						<ListItemText primary={t.login} />
					</MenuItem>}

				</Menu>
				<export_dialog.Dialog title={t.export_modal_title}>
					<CreateImportURL />
				</export_dialog.Dialog>
				<donation_dialog.Dialog title={t.about_donation}>
					<Donation />
				</donation_dialog.Dialog>
				<password_dialog.Dialog title={t.change_password_title}>
					<ResetPassword onChange={handlePasswordChange}/>
				</password_dialog.Dialog>
			</Toolbar>
		</AppBar>
	);
}

export default Header;
