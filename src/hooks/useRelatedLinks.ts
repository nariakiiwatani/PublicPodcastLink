import { useState, useEffect, useCallback } from 'react'
import { ReturnType as RelatedLinksResultType } from '../../functions/related_links/related_links'

const ENDPOINT =`${import.meta.env.VITE_API_PATH}/related_links` 

const get_related_links = async (channel: string): Promise<RelatedLinksResultType> => {
	const url = `${ENDPOINT}?channel=${channel}`
	const result = await fetch(url)
	if(result.status === 404) {
		return {
			data: []
		}
	}
	return await result.json()
}

const update_related_links = async (id: string, links: string[]): Promise<RelatedLinksResultType> => {
	const url = `${ENDPOINT}/${id}`
	const result = await fetch(url, {
		method: 'PUT',
		body: links.join(',')
	})
	return await result.json()
}
const insert_related_links = async (channel: string, links: string[]): Promise<RelatedLinksResultType> => {
	const url = `${ENDPOINT}?channel=${channel}`
	const result = await fetch(url, {
		method: 'POST',
		body: links.join(',')
	})
	return await result.json()
}

export const useRelatedLinks = (url: string) => {
	const [result, setResult] = useState<RelatedLinksResultType>(null)
	useEffect(() => {
		get_related_links(url)
		.then(setResult)
		.catch(e=>console.info({e}))
	}, [url])
	const update = useCallback((links: string[]):false|Promise<RelatedLinksResultType> => {
		return (result && result.id
			? update_related_links(result.id, links)
			: insert_related_links(url, links)
		)
		.then(result => {
			setResult(result)
			return result
		})
	}, [url, result])
	return {
		value: result,
		update
	}
}