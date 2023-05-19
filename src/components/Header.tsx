import { AppBar, Toolbar, Typography, IconButton, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';

const Header = () => {
	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					Instant Podcast Player
				</Typography>
				<IconButton color="inherit" component={Link} href="https://github.com/nariakiiwatani/InstantPodcastPlayer">
					<GitHubIcon />
				</IconButton>
				<IconButton color="inherit" component={Link} href="https://twitter.com/nariakiiwatani">
					<TwitterIcon />
				</IconButton>
				<Link href="https://www.buymeacoffee.com/nariakiiwatani" target="_blank">
					<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style={{ height: '28px', width: '101px', marginLeft: '10px' }} />
				</Link>
			</Toolbar>
		</AppBar>
	);
}

export default Header;
