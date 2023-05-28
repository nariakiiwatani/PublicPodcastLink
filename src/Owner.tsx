import React, { useState, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useAsync } from 'react-use'

function useQuery() {
	const location = useLocation()
	const params = useParams()
	return useMemo(() => {
		return {
			channel: params.channel, 
			key: new URLSearchParams(location.search).get('key')
		}
	}, [location.search, params.channel])
}

const check_if_valid_owner = async (channel: string, key: string) => {
	const url = `${import.meta.env.VITE_API_PATH}/check_owner?channel=${channel}&key=${key}`
	const result = await fetch(url)
	return result.ok
}

const Owner : React.FC = () => {
	const {channel, key} = useQuery()
	const { loading, error, value } = useAsync(async () => {
		if(!channel || !key) {
			return
		}
		return await check_if_valid_owner(channel, key)
	}, [channel, key])
	return (<>
	<p>{value?'t':'f'}</p>
	<p>{channel}</p>
	<p>{key}</p>
	</>)
}
export default Owner