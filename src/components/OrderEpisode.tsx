import { Select, MenuItem, SelectChangeEvent, FormControl, InputLabel } from '@mui/material';

export const OrderEpisode = ({ value, label, onChange }: {
	value: string,
	label?: string
	onChange: (_: SelectChangeEvent) => void
}) => {
	return <FormControl sx={{ width: 200, marginTop: 1 }}>
		<InputLabel variant="standard" htmlFor="episode-order-element">
			{label}
		</InputLabel>
		<Select
			id='episode-order-element'
			variant='standard'
			label={label}
			value={value}
			onChange={onChange}
		>
			<MenuItem value='listed'>並べ替えなし（RSS記載順）</MenuItem>
			<MenuItem value='date_desc'>最新順</MenuItem>
			<MenuItem value='date_asc'>古い順</MenuItem>
		</Select>
	</FormControl>
}
