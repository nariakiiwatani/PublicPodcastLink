import { Grid, Button } from '@mui/material';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

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

type NavigatorProps = {
	episodes: {title:string}[]
	index: number
	onPrev: ()=>void,
	onNext: ()=>void
}
export const Navigator = ({episodes, index, onPrev, onNext}:NavigatorProps) => {
	let [left, right] = [
		{
			title: episodes[index - 1]?.title,
			onClick: onPrev,
			disabled: index <= 0
		},
		{
			title: episodes[index + 1]?.title,
			onClick: onNext,
			disabled: index >= episodes.length - 1
		},
	]
	return <NavigatorButtons
		prev={{
			...left,
			value: <><SkipPreviousIcon />{left.title}</>,
		}}
		next={{
			...right,
			value: <>{right.title}<SkipNextIcon /></>,
		}}
	/>
}