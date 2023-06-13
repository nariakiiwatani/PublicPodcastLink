import { useState, useCallback, useMemo } from 'react'
type Track = {
	id: string
}
export const useTrackControl = <T extends Track,>(tracks: T[]) => {
	const [currentTrack, setCurrentTrack] = useState<T | null>(null)
	const setCurrentTrackById = useCallback((id: string) => {
		const next_track = tracks.find(t=>t.id===id)
		if(next_track) {
			setCurrentTrack(next_track)
		}
		return next_track
	}, [tracks])
	const currentIndex = useMemo(() => {
		return tracks.findIndex(t=>t===currentTrack)
	}, [tracks, currentTrack])
	const next = useCallback(() => {
		if(!tracks || currentIndex > tracks.length-2) {
			return
		}
		setCurrentTrack(tracks[currentIndex+1])
	}, [tracks, currentIndex])
	const prev = useCallback(() => {
		if(!tracks || currentIndex <= 0) {
			return
		}
		setCurrentTrack(tracks[currentIndex-1])
	}, [tracks, currentIndex])
	const clear = useCallback(() => {
		setCurrentTrack(null)
	}, [])
	return {
		track: currentTrack,
		index: currentIndex,
		next,
		prev,
		set: setCurrentTrackById,
		clear
	}
}