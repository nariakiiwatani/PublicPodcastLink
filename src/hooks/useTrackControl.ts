import { useState, useEffect, useCallback, useMemo } from 'react'
type Track = {
	id: string
}
export const useTrackControl = <T extends Track,>(tracks: T[], onChange:(track:T|null)=>void) => {
	const [currentTrack, setCurrentTrack] = useState<T | null>(null)
	const [defferedId, setDefferdID] = useState<string|null>(null)
	const handleChangeTrack = useCallback((track: T|null) => {
		onChange(track)
		setCurrentTrack(track)
	}, [onChange])
	const setCurrentTrackById = useCallback((id: string) => {
		const next_track = tracks.find(t=>t.id===id)
		if(next_track) {
			handleChangeTrack(next_track)
			return true
		}
		else {
			setDefferdID(id)
			return false
		}
	}, [tracks, handleChangeTrack])
	useEffect(() => {
		if(defferedId && setCurrentTrackById(defferedId)) {
			setDefferdID(null)
		}
	}, [tracks])
	const currentIndex = useMemo(() => {
		return tracks.findIndex(t=>t===currentTrack)
	}, [tracks, currentTrack])
	const next = useMemo(() => {
		if(!tracks || currentIndex > tracks.length-2) {
			return null
		}
		return () => handleChangeTrack(tracks[currentIndex+1])
	}, [tracks, currentIndex, handleChangeTrack])
	const prev = useMemo(() => {
		if(!tracks || currentIndex <= 0) {
			return null
		}
		return () => handleChangeTrack(tracks[currentIndex-1])
	}, [tracks, currentIndex, handleChangeTrack])
	const clear = useCallback(() => {
		handleChangeTrack(null)
	}, [handleChangeTrack])
	return {
		track: currentTrack,
		index: currentIndex,
		next,
		prev,
		set: setCurrentTrackById,
		clear
	}
}