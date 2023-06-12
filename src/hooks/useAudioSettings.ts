import { useState, useCallback, useEffect } from 'react';

export const useAutoPlay = () => {
	const [autoPlay, setAutoPlay] = useState(()=>JSON.parse(localStorage.getItem('autoplay') ?? 'false'))
	const set = useCallback((b:boolean) => {
		setAutoPlay(b)
		localStorage.setItem('autoplay', JSON.stringify(b))
	}, [])
	return {
		autoPlay,
		set
	}
}

export const usePlaybackRate = (channel?: string):[number, (_:number)=>void] => {
	const [rate, setRate] = useState(1)
	useEffect(() => {
		setRate(JSON.parse(localStorage.getItem(`${channel}/playbackRate`)??'1.0'))
	}, [channel])
	const set = useCallback((r:number) => {
		if(!channel) return
		setRate(r)
		localStorage.setItem(`${channel}/playbackRate`, JSON.stringify(r))
	}, [channel])
	return [
		rate,
		set
	]
}