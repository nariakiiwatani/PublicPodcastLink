import { Grid, Button } from '@mui/material';

type NavigatorButtonProps = {
	disabled?: boolean
	onClick: ()=>void
	value: React.ReactNode
}
type NavigatorButtonsProps = {
	next?: NavigatorButtonProps,
	prev?: NavigatorButtonProps,
}

const NavigatorButton = ({value, onClick, disabled}:NavigatorButtonProps) => {
	return <Button onClick={onClick} variant='text' disabled={disabled}>{value}</Button>
}

export const NavigatorButtons = ({next, prev }:NavigatorButtonsProps) => {
	return (
		<Grid container display='flex' justifyContent='center'>
			<Grid item xs={6} display='flex' justifyContent={'left'}>
				{prev && <NavigatorButton {...prev} />}
			</Grid>
			<Grid item xs={6} display='flex' justifyContent={'right'}>
				{next && <NavigatorButton {...next} />}
			</Grid>
		</Grid>

	)
}
