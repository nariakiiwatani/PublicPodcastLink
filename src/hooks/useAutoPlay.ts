import { useState, useCallback } from 'react';

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