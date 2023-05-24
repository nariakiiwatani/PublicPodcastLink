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
	const query = new URLSearchParams(window.location.search)
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
			]}
		/>
	</HelmetProvider>)
	}
	(window as unknown as {prerenderReady:boolean}).prerenderReady = true
	const info = (() => {
		const title = (e?e.title:'')+(p?e?` (${p.title})`:p.title:'')
		return {
			title,
			site_name: s.title,
			url: e?e.link:p?p.link:s.link,
			image: e?e.imageUrl:p?p.imageUrl:s.imageUrl,
			description: e?e.description:p?p.description:s.description,
		}
	})()
	return (<HelmetProvider>
		<Helmet
			title={info.title}
			meta={[
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ property: 'og:title', content: info.title },
				{ property: 'og:type', content: 'website' },
				{ property: 'og:url', content: info.url },
				{ property: 'og:image', content: info.image },
				{ property: 'og:description', content: info.description },
			]}
		/>
	</HelmetProvider>)
}

