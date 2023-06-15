import { useState, useCallback, useMemo } from 'react'
type Track = {
	id: string
}
export const useTrackControl = <T extends Track,>(tracks: T[], onChange:(id:string|null)=>void) => {
	const [currentTrack, setCurrentTrack] = useState<T | null>(null)
	const handleChangeTrack = (track: T|null) => {
		onChange(track?.id??null)
		setCurrentTrack(track)
	}
	const setCurrentTrackById = useCallback((id: string) => {
		const next_track = tracks.find(t=>t.id===id)
		if(next_track) {
			handleChangeTrack(next_track)
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
		handleChangeTrack(tracks[currentIndex+1])
	}, [tracks, currentIndex])
	const prev = useCallback(() => {
		if(!tracks || currentIndex <= 0) {
			return
		}
		handleChangeTrack(tracks[currentIndex-1])
	}, [tracks, currentIndex])
	const clear = useCallback(() => {
		handleChangeTrack(null)
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