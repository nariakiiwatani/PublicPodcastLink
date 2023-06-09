import { useState, useMemo, useCallback } from 'react';
import { EpisodeList, EpisodeSelect } from '../components/EpisodeList';
import { NavigatorButtons } from '../components/NavigatorButtons';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PodcastInput from '../components/PodcastInput';
import usePodcast from './usePodcast';

export const useEpisodeSelect = () => {
	const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
	const { podcast, episodes, fetchPodcast } = usePodcast();
	const episode = episodes.find(({ id }) => id === selectedEpisodeId) ?? null;

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
		}
	}, [episodes, currentIndex])
	const handleChangeEpisode = useCallback((id: string) => {
		setSelectedEpisodeId(id)
	}, [setSelectedEpisodeId])
	const Input = useCallback(() => <PodcastInput setUrl={handleUrlInput} option={podcast} />, [podcast])
	const Select = useCallback(() => <EpisodeSelect episodes={episodes} onSelect={handleChangeEpisode} />, [episodes])
	const List = useCallback(() => <EpisodeList episodes={episodes} onSelect={handleChangeEpisode} />, [episodes])

	const Navigator = useMemo(() =>
		<NavigatorButtons
			prev={{
				value: <><SkipPreviousIcon />{episodes[currentIndex + 1]?.title}</>,
				onClick: () => handleChangeIndex(1),
				disabled: currentIndex >= episodes.length - 1
			}}
			next={{
				value: <>{episodes[currentIndex - 1]?.title}<SkipNextIcon /></>,
				onClick: () => handleChangeIndex(-1),
				disabled: currentIndex <= 0
			}}
		/>, [handleChangeIndex, currentIndex, episodes.length])

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
		fetch_rss
	}
}
