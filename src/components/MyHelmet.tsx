import { useState } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Podcast, Episode } from '../types/podcast';

type MyHelmetProps = {
	podcast: Podcast | null
	episode: Episode | null
}
const s = {
	title: 'PublicPodcastLink',
	description: `Make and share your podcasts' permalink`,
	imageUrl: `${window.origin}/android-chrome-512x512.png`,
	link: window.origin
}
export const MyHelmet = ({podcast:p, episode:e}:MyHelmetProps) => {
	const [query, _setQuery] = useState(()=>new URLSearchParams(window.location.search))
	const channel = (() => {
		const channel = query.get('channel')
		return channel && !channel.includes(',') 
	})()
	const item = query.get('item') !== null
	const is_ready = item?p&&e:channel?p:true
	if(!is_ready) {
		return (<HelmetProvider>
			<Helmet
				title={s.title}
				meta={[
					{ name: 'twitter:card', content: 'summary_large_image' },
					{ property: 'og:title', content: s.title },
					{ property: 'og:type', content: 'website' },
					{ property: 'og:url', content: s.link },
					{ property: 'og:image', content: s.imageUrl },
					{ property: 'og:description', content: s.description },
					{ property: 'og:site_name', content: 'PublicPodcastLink' },
				]}
			/>
		</HelmetProvider>)
	}
	(window as unknown as {prerenderReady:boolean}).prerenderReady = true
	
	const info = (() => {
		if(!channel) p = null
		if(!item) e = null
		const title = (e?e.title:'')+(p?e?` (${p.title})`:p.title:'')+(p?' - ':'')+s.title
		const ret:{[key:string]:any} = {
			title,
			site_name: s.title,
			url: e?e.link:p?p.link:s.link,
			image: e?e.imageUrl:p?p.imageUrl:s.imageUrl,
			description: e?e.description:p?p.description:s.description,
		}
		if(e) {
			ret.audio = {
				url: e.mediaUrl,
				type: e.type
			}
		}
		return ret
	})()
	let meta = [
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ property: 'og:title', content: info.title },
		{ property: 'og:type', content: 'article' },
		{ property: 'og:url', content: info.url },
		{ property: 'og:image', content: info.image },
		{ property: 'og:description', content: info.description },
		{ property: 'og:site_name', content: 'PublicPodcastLink' },
	]
	if(info.audio) {
		meta = [...meta,
			{ property: 'og:audio', content: info.audio.url },
			{ property: 'og:audio:secure_url', content: info.audio.url },
			{ property: 'og:audio:type', content: info.audio.type },
		]
	}
	return (<HelmetProvider>
		<Helmet
			title={info.title}
			meta={meta}
		/>
	</HelmetProvider>)
}

