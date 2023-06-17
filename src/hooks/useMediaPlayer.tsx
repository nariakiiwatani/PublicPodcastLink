import { useCallback, useRef, useState } from 'react'
import { useAutoPlay } from '../hooks/useAudioSettings';

export const useMediaPlayer = () => {
	const mediaRef = useRef<HTMLAudioElement & HTMLVideoElement>(null)
	const { autoPlay } = useAutoPlay()
	const load = useCallback((src: string, type: string) => {
		const is_video = type && /^video\/.*/.test(type)
		const element = is_video ? <video
					key={src}
					controls
					playsInline
					style={{ width: '100%', marginTop: 5 }}
					autoPlay={mediaRef.current?.autoplay??autoPlay}
					ref={mediaRef}
				>
					<source src={src} type={type} />
					Your browser does not support the video element.
				</video> : <audio
					key={src}
					controls
					style={{ width: '100%', marginTop: 5 }}
					autoPlay={mediaRef.current?.autoplay??autoPlay}
					ref={mediaRef}
				>
					<source src={src} type={type} />
					Your browser does not support the audio element.
				</audio>

		setNode(element)
		return element
	}, [])
	const [Node, setNode] = useState<JSX.Element>(<></>)

	return {
		load,
		Node,
		element: mediaRef.current
	}
}