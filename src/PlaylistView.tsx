import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './utils/supabase'

const PlaylistView = () => {
	const navigate = useNavigate()
	const [message, setMessage] = useState('redirect...')
	const {id} = useParams()
	useEffect(() => {
		if(id) {
			supabase.from('playlist').select('channel').eq('alias', id)
			.then(({data}) => {
				if(!data || data.length === 0) {
					setMessage('not found')
					return
				}
				navigate(`/?channel=${data[0].channel}`)
			})
		}
	},[])
	return <>{message}</>
}

export default PlaylistView