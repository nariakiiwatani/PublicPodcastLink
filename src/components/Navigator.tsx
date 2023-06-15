import { Grid, Button } from '@mui/material';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

type NavigatorButtonProps = {
	onClick: (()=>void)|null
	value: React.ReactNode
}
type NavigatorButtonsProps = {
	next?: NavigatorButtonProps,
	prev?: NavigatorButtonProps,
}

const NavigatorButton = ({value, onClick}:NavigatorButtonProps) => {
	return <Button onClick={onClick??undefined} variant='text' disabled={!onClick}>{value}</Button>
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
	onPrev: (()=>void)|null,
	onNext: (()=>void)|null
}
export const Navigator = ({episodes, index, onPrev, onNext}:NavigatorProps) => {
	let [left, right] = [
		{
			title: episodes[index - 1]?.title,
			onClick: onPrev,
		},
		{
			title: episodes[index + 1]?.title,
			onClick: onNext,
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