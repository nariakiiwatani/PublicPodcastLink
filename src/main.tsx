import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './hooks/useTranslation.tsx'
import Owner from './Owner.tsx'
import { SessionProvider } from './utils/supabase.tsx'
import usePageTracking from './hooks/useTracking.ts'
import PlaylistView from './PlaylistView'

const Tracking = ({children}:{children:React.ReactNode}) => {
	usePageTracking()
	return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<SessionProvider>
		<LanguageProvider>
			<BrowserRouter>
			<Tracking>
				<Routes>
					<Route path='/playlist/:id/view' element={<PlaylistView />} />
					<Route path='/owner' element={<Owner />} />
					<Route path='/' element={<App />} />
				</Routes>
				</Tracking>
			</BrowserRouter>
		</LanguageProvider>
		</SessionProvider>
	</React.StrictMode>,
)
