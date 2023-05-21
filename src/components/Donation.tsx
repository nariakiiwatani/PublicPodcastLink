import { List, ListItem, ListItemText, ListSubheader } from '@mui/material'
import { useTranslation } from '../hooks/useTranslation'

const DonatorList = () => {
	const { t }  = useTranslation('donation')
	const list = [
		'Kendea',
		'サカプル番外編'
	]
	return (
		<div>
			<List>
				<ListSubheader disableGutters>
					{t.list_header}
				</ListSubheader>
				{list.map((name,i) => 
				<ListItem key={i} disablePadding>
					<ListItemText
						primary={name}
						primaryTypographyProps={{
							variant:'body2'
						}}
					/>
				</ListItem>)}
			</List>
		</div>)
}

const Donation = () => {
	const { t }  = useTranslation('donation')
	return (<>
		{t.body}
		<DonatorList />
	</>)
}
export default Donation