import { useState, useCallback, useMemo } from 'react';
import { EpisodeList, EpisodeSelect } from '../components/EpisodeList';
import { NavigatorButtons } from '../components/NavigatorButtons';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PodcastInput from '../components/PodcastInput';
import usePodcast from './usePodcast';
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';

const OrderEpisode = ({value, onChange}:{
	value: string,
	onChange: (_: SelectChangeEvent)=>void
}) => {
	return <Select
		variant='standard'
		value={value as string}
		onChange={onChange}
	>
		<MenuItem value='listed'>並べ替えなし（RSS記載順）</MenuItem>
		<MenuItem value='date_desc'>最新順</MenuItem>
		<MenuItem value='date_asc'>古い順</MenuItem>
	</Select>
}

export const useEpisodeSelect = () => {
	const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
	const [episode_order, setEpisodeOrder] = useState<'listed'|'date_asc'|'date_desc'>('listed')
	const { podcast, episodes, fetchPodcast } = usePodcast(undefined, {order_by:episode_order});
	const episode = useMemo(() => episodes.find(({ id }) => id === selectedEpisodeId) ?? null, [episodes, selectedEpisodeId])

	const handleUrlInput = (value: string) => {
		try {
			const url = new URL(value)
			return fetchPodcast(url.toString()).then(result=>{if(result) setSelectedEpisodeId(null)})
		}
		catch (e) {
			console.error(e)
		}
	}

	const currentIndex = episodes.findIndex(({ id }) => id === selectedEpisodeId);
	const handleChangeIndex = useCallback((diff: number) => {
		const index = episodes.findIndex(({ id }) => id === selectedEpisodeId) + diff;
		if (index >= 0 && index < episodes.length) {
			handleChangeEpisode(episodes[index].id);
			return true
		}
		return false
	}, [episodes, currentIndex])
	const handleChangeEpisode = useCallback((id: string) => {
		setSelectedEpisodeId(id)
	}, [setSelectedEpisodeId])
	const Input = useCallback(({deletable}:{deletable?:boolean}) => <PodcastInput setUrl={handleUrlInput} option={podcast} deletable={deletable} />, [podcast])
	const Select = useCallback(() => <EpisodeSelect episodes={episodes} selected_id={selectedEpisodeId} onSelect={handleChangeEpisode} />, [episodes])
	const List = useCallback(() => <EpisodeList episodes={episodes} onSelect={handleChangeEpisode} />, [episodes])

	const handleChangeOrder = (e: SelectChangeEvent) => {
		const v = e.target.value
		if(v === 'listed' || v === 'date_asc' || v === 'date_desc') {
			setEpisodeOrder(v)
		}
	}
	const OrderSelect = useCallback(() => (<OrderEpisode value={episode_order as string} onChange={handleChangeOrder} />), [episode_order])

	const Navigator = useCallback(({swap}:{swap?:boolean}) => {
		let [left, right] = [
			{
				title: episodes[currentIndex + 1]?.title,
				onClick: () => handleChangeIndex(1),
				disabled: currentIndex >= episodes.length - 1
			},
			{
				title: episodes[currentIndex - 1]?.title,
				onClick: () => handleChangeIndex(-1),
				disabled: currentIndex <= 0
			}
		]
		if(swap) [left, right] = [right, left]
		return <NavigatorButtons
			prev={{
				...left,
				value: <><SkipPreviousIcon />{left.title}</>,
			}}
			next={{
				...right,
				value: <>{right.title}<SkipNextIcon /></>,
			}}
		/>}, [handleChangeIndex, currentIndex, episodes.length])

	const fetch_rss = (url: string, select_item_id: string | null = null) => {
		handleUrlInput(url)?.then(() => select_item_id && handleChangeEpisode(select_item_id))
	}
	return {
		podcast,
		episode,
		episodes,
		Navigator,
		Input,
		List,
		Select,
		OrderSelect,
		fetch_rss,
		progress:handleChangeIndex
	}
}
