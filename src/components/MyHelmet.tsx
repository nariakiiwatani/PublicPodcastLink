import { Helmet, HelmetProvider } from 'react-helmet-async'
import { useMemo } from 'react'
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
	const info = useMemo(() => {
		const title = (e?e.title:'')+(p?e?` (${p.title})`:p.title:'')+(p?' - ':'')+s.title
		return {
			title,
			url: e?e.link:p?p.link:s.link,
			image: e?e.imageUrl:p?p.imageUrl:s.imageUrl,
			description: e?e.description:p?p.description:s.description,
		}
	}, [p, e])
	return (<HelmetProvider>
		<Helmet
			title={info.title}
			meta={[
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:site', content: '@nariakiiwatani' },
				{ property: 'og:title', content: info.title },
				{ property: 'og:type', content: 'website' },
				{ property: 'og:url', content: info.url },
				{ property: 'og:image', content: info.image },
				{ property: 'og:description', content: info.description },
			]}
		/>
	</HelmetProvider>)
}

