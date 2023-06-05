import { useState, useContext } from 'react';
import { Checkbox, List, ListItem, ListItemText, ListItemSecondaryAction, Typography, Box, Divider } from '@mui/material';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import LinkIcon from '@mui/icons-material/Link';
import { permalink } from '../utils/permalink';
import { useTranslation } from '../hooks/useTranslation';
import { FollowingContext } from '../hooks/useFollows';

export const CreateImportURL = () => {
	const { t } = useTranslation('create_import_url')
	const { podcasts:items } = useContext(FollowingContext)
	const [selectedItems, setSelectedItems] = useState<Array<boolean>>(new Array(items.length).fill(true));

	const handleToggle = (index: number) => () => {
		const newSelectedItems = [...selectedItems];
		newSelectedItems[index] = !newSelectedItems[index];
		setSelectedItems(newSelectedItems);
	};
	const numSelectedItems = selectedItems.filter(s => s).length
	const isAllSelected = numSelectedItems === items.length;
	const isSomeSelected = numSelectedItems > 0;

	const handleToggleAll = () => {
		setSelectedItems(new Array(items.length).fill(!isAllSelected));
	};

	const resultUrl = permalink(items
		.filter((_, index) => selectedItems[index])
		.map(item => item.url)
		.join(','));

	return (
		<div>
			<List>
				<ListItem>
					<ListItemText
						primary={<Typography variant='subtitle1'>{t.all}</Typography>}
					/>
					<ListItemSecondaryAction>
						<Checkbox
							edge='end'
							checked={isAllSelected}
							indeterminate={isSomeSelected && !isAllSelected}
							onChange={handleToggleAll}
						/>
					</ListItemSecondaryAction>
				</ListItem>
			</List>
			<Divider />
			<List sx={{ maxHeight: '50vh', overflow: 'scroll' }}>
				{items.map((item, index) => (
					<ListItem key={index}>
						<ListItemText
							primary={item.title}
							secondary={<Typography
								variant='caption'
								color='primary'
							>{item.url}</Typography>
							}
						/>
						<ListItemSecondaryAction>
							<Checkbox edge="end" checked={selectedItems[index]} onChange={handleToggle(index)} />
						</ListItemSecondaryAction>
					</ListItem>
				))}
			</List>
			<Divider />
			<Box sx={{ marginTop: 2 }}>
				<Typography>{t.selected(numSelectedItems)}</Typography>
				<CopyToClipboardButton
					value={resultUrl}
					disabled={numSelectedItems === 0}
					disable_tooltip={true}
					Icon={<>
						<LinkIcon color={numSelectedItems > 0 ? 'primary' : undefined} />
						<Typography
							variant='body1'
							sx={{ marginLeft: 1 }}
						>{t.copy}</Typography>
					</>}
				/>
			</Box>
		</div>
	);
}
