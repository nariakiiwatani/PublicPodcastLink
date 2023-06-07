import { useState, useMemo } from 'react'
import PlaylistEditor from './PlaylistEditor'
import PlaylistSelection from './PlaylistSelection'
import { FollowingProvider } from '../../hooks/useFollows'
import { Podcast, Episode } from '../../types/podcast'

export type Playlist = {
	channel: Podcast,
	items: Episode[]
}

const make_empty_playlist = (): Playlist => {
	return {
		channel: {
			title: '',
			description: '',
			link: '',
			imageUrl: '',
			author: '',
			self_url: '',
			owner: {
				email: ''
			}
		},
		items: []
	}
}

const fetch_playlist = (id: string): Playlist => {
	const ret = make_empty_playlist()
	ret.channel.title = id
	return ret
}

export default () => {
	const [value, setValue] = useState<Playlist>(() => make_empty_playlist())
	const handleSelect = (id: string) => {
		setValue(fetch_playlist(id))
	}
	const handleNew = () => {
		setValue(make_empty_playlist())
	}
	const handleSave = (channel: Podcast, items: Episode[]) => {
		setValue({channel, items})
	}
	return <>
		<FollowingProvider>
			<PlaylistSelection playlists={[]} onSelect={handleSelect} onNew={handleNew} />
			<PlaylistEditor value={value} onSave={handleSave} />
		</FollowingProvider>
	</>
}