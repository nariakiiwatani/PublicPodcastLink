import usePodcast from '../hooks/usePodcast'

export const FetchTitle = ({url}:{url:string}) => {
	const { podcast } = usePodcast(url)
	return (<>
		{podcast?.title??url}
	</>)
}
