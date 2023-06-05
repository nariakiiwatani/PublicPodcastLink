import { TextField, Button, CircularProgress, Link, Typography } from '@mui/material'
import { useState, FormEvent, useContext, useRef, useEffect } from 'react'
import { useQuery } from '../hooks/useQuery'
import { useTranslation } from '../hooks/useTranslation'
import { supabase, SessionContext } from '../utils/supabase'

export const redirectURL = (channel: string | null) => `${window.origin}/owner${channel ? `?channel=${channel}` : ''}`
export const Signup = () => {
	const { t } = useTranslation('login')
	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState('')
	const query = useQuery()

	const handleLogin = async (event: FormEvent) => {
		event.preventDefault()

		setLoading(true)
		const channel = query.get('channel')
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: redirectURL(channel)
			}
		})

		if (error) {
			alert(error.message)
		} else {
			alert(t.check_email)
		}
		setLoading(false)
	}

	return (<>
		<form className="form-widget" onSubmit={handleLogin}>
			<TextField
				fullWidth
				type="email"
				label="email"
				value={email}
				required={true}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<Button disabled={loading} variant='contained' type='submit'>
				{loading ? <CircularProgress /> : <>Send magic link</>}
			</Button>
		</form>
	</>
	)
}
export const Login = () => {
	const { t } = useTranslation('login')
	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleLogin = async (event: FormEvent) => {
		event.preventDefault()

		setLoading(true)
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			alert(error.message)
		}
		setLoading(false)
	}

	return (<>
		<form className="form-widget" onSubmit={handleLogin}>
		<TextField
				fullWidth
				type="email"
				label="email"
				value={email}
				required={true}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<TextField
				fullWidth
				type="password"
				label="password"
				value={password}
				required={true}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<Button disabled={loading} variant='contained' type='submit'>
				{loading ? <CircularProgress /> : <>{t.login_button}</>}
			</Button>
		</form>
	</>
	)
}
export const CheckAuth = ({ children }: { children: React.ReactNode }) => {
	const { session } = useContext(SessionContext)
	const [is_signup, setIsSignup] = useState(false)
	const toggleMode = () => { setIsSignup(prev=>!prev) }
	return (
		!session ?
			is_signup ? <>
				<Typography variant='h6'>Sign up <Link variant='caption' onClick={toggleMode}>or log in?</Link></Typography>
				<Signup />
			</> : <>
				<Typography variant='h6'>Log in <Link variant='caption' onClick={toggleMode}>or sign up?</Link></Typography>
				<Login />
			</>
			: <>
				{children}
			</>
	)
}

type ResetPasswordProps = {
	onChange: ()=>void
}
export const ResetPassword = ({onChange}:ResetPasswordProps) => {
	const { t } = useTranslation('login')
	const [value, setValue] = useState('')
	const [check, setCheck] = useState('')
	const [loading, setLoading] = useState(false)
	const checkRef = useRef<HTMLInputElement>(null)

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()

		setLoading(true)
		const { error } = await supabase.auth.updateUser({
			password: value,
		})

		if (error) {
			alert(error.message)
		}
		else {
			onChange()
		}
		setLoading(false)
	}

	useEffect(() => {
		if(!checkRef.current) return
		checkRef.current?.setCustomValidity(value === check ? '' : 'mismatch')
	}, [checkRef.current, value, check])

	return (<>
		<form className="form-widget" onSubmit={handleSubmit}>
		<TextField
				fullWidth
				type="password"
				label='new password'
				value={value}
				required={true}
				onChange={e=>setValue(e.target.value)}
			/>
			<TextField
				fullWidth
				type="password"
				label="confirm password"
				value={check}
				required={true}
				inputRef={checkRef}
				onChange={e=>setCheck(e.target.value)}
				/>
			<Button disabled={loading} variant='contained' type='submit'>
				{loading ? <CircularProgress /> : <>{t.reset_password_button}</>}
			</Button>
		</form>
	</>
	)
}