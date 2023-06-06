import { useState, useMemo } from 'react';
import EpisodeList from '../components/EpisodeList';
import { NavigatorButtons } from '../components/NavigatorButtons';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PodcastInput from '../components/PodcastInput';
import usePodcast from './usePodcast';

export const useEpisodeSelect = () => {
	const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
	const { podcast, episodes, fetchPodcast } = usePodcast();
	const episode = episodes.find(({id}) => id === selectedEpisodeId) ?? null;

	const handleUrlInput = (value: string) => {
		try {
			const url = new URL(value)
			return fetchPodcast(url.toString())
		}
		catch(e) {
			console.error(e)
		}
	}

	const currentIndex = episodes.findIndex(({id}) => id === selectedEpisodeId);

	const onNext = () => {
		if (currentIndex > 0) {
			setSelectedEpisodeId(episodes[currentIndex - 1].id);
		}
	};

	const onPrevious = () => {
		if (currentIndex < episodes.length - 1) {
			setSelectedEpisodeId(episodes[currentIndex + 1].id);
		}
	};
	const Selector = useMemo(() => ()=> <>
		<PodcastInput setUrl={handleUrlInput} option={podcast} />
		{podcast && <EpisodeList episodes={episodes} selectedEpisodeId={selectedEpisodeId} setSelectedEpisodeId={setSelectedEpisodeId} />}
	</>, [podcast, episodes, selectedEpisodeId])

	const Navigator = useMemo(() =>
		<NavigatorButtons
			prev={{
				value: <><SkipPreviousIcon />{episodes[currentIndex + 1]?.title}</>,
				onClick: onPrevious,
				disabled: currentIndex >= episodes.length - 1
			}}
			next={{
				value: <>{episodes[currentIndex - 1]?.title}<SkipNextIcon /></>,
				onClick: onNext,
				disabled: currentIndex <= 0
			}}
		/>, [onPrevious, onNext, currentIndex, episodes.length])
	
		const fetch_rss = (url: string, select_item_id: string|null = null) => {
			handleUrlInput(url)?.then(()=>setSelectedEpisodeId(select_item_id??null))
		}
	return {
		podcast,
		episode,
		Selector,
		Navigator,
		fetch_rss
	}
}
